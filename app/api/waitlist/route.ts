import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type BodyPayload = {
  email?: unknown;
  source?: unknown;
};

function normalizeEmail(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim();
}

function isPlausibleEmail(email: string): boolean {
  if (email.length < 3 || email.length > 254) return false;
  const at = email.indexOf("@");
  if (at <= 0 || at !== email.lastIndexOf("@")) return false;
  const dot = email.lastIndexOf(".");
  if (dot < at + 2 || dot === email.length - 1) return false;
  return true;
}

export async function POST(request: Request) {
  let body: BodyPayload;
  try {
    body = (await request.json()) as BodyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const emailLower = email.toLowerCase();
  const source =
    typeof body.source === "string" ? body.source.slice(0, 191) : null;

  if (!email || !isPlausibleEmail(emailLower)) {
    return NextResponse.json(
      { error: "Please enter a valid email." },
      { status: 400 },
    );
  }

  try {
    await prisma.waitlistSignup.upsert({
      where: { emailLower },
      create: { email, emailLower, source },
      update: { email, source: source ?? undefined },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save email." },
      { status: 500 },
    );
  }
}
