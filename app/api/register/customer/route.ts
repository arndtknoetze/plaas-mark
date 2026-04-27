import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type BodyPayload = {
  name?: unknown;
  phone?: unknown;
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

export async function POST(request: Request) {
  let body: BodyPayload;
  try {
    body = (await request.json()) as BodyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = normalizePhone(body.phone);
  const verificationToken =
    typeof body.verificationToken === "string"
      ? body.verificationToken.trim()
      : "";

  if (!name || !phone) {
    return NextResponse.json(
      { error: "Name and phone are required." },
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
    const customer = await prisma.$transaction(async (tx) => {
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

      return tx.customer.upsert({
        where: { phone },
        create: { name, phone },
        update: { name },
      });
    });

    return NextResponse.json({ ok: true, customerId: customer.id });
  } catch (err) {
    if (err instanceof ForbiddenRegistrationError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to register customer." },
      { status: 500 },
    );
  }
}
