import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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

export async function POST(request: Request) {
  let body: BodyPayload;
  try {
    body = (await request.json()) as BodyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
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
  if (!verificationToken) {
    return NextResponse.json(
      { error: "Phone verification is required." },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
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

      const seller = await tx.seller.upsert({
        where: { phone },
        create: { name, phone, brandName, brandColor, logoUrl },
        update: { name, brandName, brandColor, logoUrl },
      });

      const baseSlug = slugify(brandName) || "store";
      let slug = baseSlug;
      let store = null as null | { id: string; slug: string };
      for (let i = 0; i < 5; i++) {
        try {
          const created = await tx.store.create({
            data: {
              sellerId: seller.id,
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

      return { seller, store };
    });

    return NextResponse.json({
      ok: true,
      sellerId: result.seller.id,
      storeId: result.store.id,
      storeSlug: result.store.slug,
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
