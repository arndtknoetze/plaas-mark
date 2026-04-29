import { NextResponse } from "next/server";
import { logApiLocationDebug } from "@/lib/api-location-debug-log";
import { prisma } from "@/lib/db";
import { getLocationFromUrlOrHeaders } from "@/lib/location";
import { isPhoneOtpDisabled } from "@/lib/phone-otp";
import { slugify } from "@/lib/slug";

type BodyPayload = {
  name?: unknown;
  phone?: unknown;
  brandName?: unknown;
  brandColor?: unknown;
  logoUrl?: unknown;
  verificationToken?: unknown;
};

class ForbiddenRegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenRegistrationError";
  }
}

function normalizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
}

function normalizeHexColor(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const v = input.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toUpperCase();
  return null;
}

function normalizeOptionalLogoUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const v = input.trim();
  if (!v) return null;
  // Keep it permissive: allow relative paths, absolute URLs, or data URLs.
  return v;
}

const FORBIDDEN_LOCATION_BODY_KEYS = [
  "locationId",
  "locationSlug",
  "location",
] as const;

export async function POST(request: Request) {
  let body: BodyPayload;
  try {
    body = (await request.json()) as BodyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    for (const key of FORBIDDEN_LOCATION_BODY_KEYS) {
      if (key in o && o[key] !== undefined) {
        return NextResponse.json(
          {
            error:
              "Location is set automatically from the site you are on; do not send location fields.",
          },
          { status: 400 },
        );
      }
    }
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = normalizePhone(body.phone);
  const brandName =
    typeof body.brandName === "string" ? body.brandName.trim() : "";
  const brandColor = normalizeHexColor(body.brandColor) ?? "#2E5E3E";
  const logoUrl = normalizeOptionalLogoUrl(body.logoUrl);
  const verificationToken =
    typeof body.verificationToken === "string"
      ? body.verificationToken.trim()
      : "";

  if (!name || !phone || !brandName) {
    return NextResponse.json(
      { error: "Name, phone, and brand name are required." },
      { status: 400 },
    );
  }
  if (!isPhoneOtpDisabled() && !verificationToken) {
    return NextResponse.json(
      { error: "Phone verification is required." },
      { status: 400 },
    );
  }

  let location;
  try {
    location = await getLocationFromUrlOrHeaders(request);
  } catch {
    return NextResponse.json(
      { error: "Location could not be resolved. Try again later." },
      { status: 500 },
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (!isPhoneOtpDisabled()) {
        const removed = await tx.phoneVerifyToken.deleteMany({
          where: {
            token: verificationToken,
            phone,
            expiresAt: { gt: new Date() },
          },
        });
        if (removed.count !== 1) {
          throw new ForbiddenRegistrationError(
            "Invalid or expired verification. Request a new code and try again.",
          );
        }
      }

      const member = await tx.member.upsert({
        where: { phone },
        create: { name, phone },
        update: { name },
        select: { id: true },
      });

      const baseSlug = slugify(brandName) || "store";
      let slug = baseSlug;
      let store = null as null | { id: string; slug: string };
      for (let i = 0; i < 5; i++) {
        try {
          const created = await tx.store.create({
            data: {
              memberId: member.id,
              locationId: location.id,
              name: brandName,
              slug,
              brandColor,
              logoUrl,
              isActive: false,
            },
            select: { id: true, slug: true },
          });
          store = created;
          break;
        } catch {
          slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
        }
      }
      if (!store) {
        throw new Error("Failed to create store.");
      }

      return { store, member };
    });

    await logApiLocationDebug("POST /api/register/seller", {
      resolvedLocationId: location.id,
      newStoreLocationId: location.id,
      otpBypass: isPhoneOtpDisabled(),
    });

    return NextResponse.json({
      ok: true,
      storeId: result.store.id,
      storeSlug: result.store.slug,
      memberId: result.member.id,
    });
  } catch (err) {
    if (err instanceof ForbiddenRegistrationError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to register seller." },
      { status: 500 },
    );
  }
}
