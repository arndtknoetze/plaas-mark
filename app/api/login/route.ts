import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type BodyPayload = {
  phone?: unknown;
  verificationToken?: unknown;
};

function normalizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
}

class ForbiddenLoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenLoginError";
  }
}

export async function POST(request: Request) {
  let body: BodyPayload;
  try {
    body = (await request.json()) as BodyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const phone = normalizePhone(body.phone);
  const verificationToken =
    typeof body.verificationToken === "string"
      ? body.verificationToken.trim()
      : "";

  if (!phone || !verificationToken) {
    return NextResponse.json(
      { error: "Phone and verificationToken are required." },
      { status: 400 },
    );
  }

  try {
    const session = await prisma.$transaction(async (tx) => {
      const removed = await tx.phoneVerifyToken.deleteMany({
        where: {
          token: verificationToken,
          phone,
          expiresAt: { gt: new Date() },
        },
      });
      if (removed.count !== 1) {
        throw new ForbiddenLoginError(
          "Invalid or expired verification. Request a new code and try again.",
        );
      }

      const seller = await tx.seller.findUnique({ where: { phone } });
      if (seller) {
        return {
          role: "seller" as const,
          name: seller.name,
          phone: seller.phone,
        };
      }

      const customer = await tx.customer.findUnique({ where: { phone } });
      if (customer) {
        return {
          role: "customer" as const,
          name: customer.name,
          phone: customer.phone,
        };
      }

      throw new ForbiddenLoginError(
        "No account found for this phone number. Please register first.",
      );
    });

    return NextResponse.json({ ok: true, session });
  } catch (err) {
    if (err instanceof ForbiddenLoginError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to log in." }, { status: 500 });
  }
}
