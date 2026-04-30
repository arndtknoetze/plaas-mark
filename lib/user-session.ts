import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSessionSigningSecret } from "@/lib/session-secret";

const COOKIE_NAME = "plaasmark-user";

type UserSessionPayload = {
  memberId: string;
  email: string;
  phone: string;
  exp: number; // unix seconds
};

function base64UrlEncode(input: string | Buffer): string {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return b
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecodeToString(input: string): string {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replaceAll("-", "+").replaceAll("_", "/") + pad;
  return Buffer.from(b64, "base64").toString("utf8");
}

function sign(input: string, secret: string): string {
  return base64UrlEncode(createHmac("sha256", secret).update(input).digest());
}

export function getUserCookieName() {
  return COOKIE_NAME;
}

export function createUserSessionToken(payload: UserSessionPayload): string {
  const secret = getSessionSigningSecret();
  if (!secret) {
    throw new Error(
      "SESSION_SECRET or ADMIN_SESSION_SECRET is required for signing user sessions.",
    );
  }
  const json = JSON.stringify(payload);
  const data = base64UrlEncode(json);
  const sig = sign(data, secret);
  return `${data}.${sig}`;
}

export function verifyUserSessionToken(
  token: string,
): UserSessionPayload | null {
  const secret = getSessionSigningSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  if (!data || !sig) return null;

  const expected = sign(data, secret);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const json = base64UrlDecodeToString(data);
    const payload = JSON.parse(json) as Partial<UserSessionPayload>;
    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.memberId !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    const email = typeof payload.email === "string" ? payload.email : "";
    const phone = typeof payload.phone === "string" ? payload.phone : "";
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) return null;
    return {
      memberId: payload.memberId,
      email,
      phone,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export async function getUserSessionOrNull() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value ?? "";
  if (!token) return null;
  return verifyUserSessionToken(token);
}
