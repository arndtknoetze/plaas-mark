import { getSessionSigningSecret } from "@/lib/session-secret";

const COOKIE_NAME = "plaasmark-admin";

type AdminSessionPayload = {
  memberId: string;
  role: "ADMIN";
  exp: number; // unix seconds
};

export function getAdminCookieName() {
  return COOKIE_NAME;
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  return b64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function hmacSha256Base64Url(data: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return base64UrlEncodeBytes(new Uint8Array(sig));
}

function base64UrlDecodeToString(input: string): string | null {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replaceAll("-", "+").replaceAll("_", "/") + pad;
  try {
    return atob(b64);
  } catch {
    return null;
  }
}

export async function verifyAdminSessionTokenEdge(
  token: string,
): Promise<AdminSessionPayload | null> {
  const secret = getSessionSigningSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  if (!data || !sig) return null;

  const expected = await hmacSha256Base64Url(data, secret);
  if (sig !== expected) return null;

  const json = base64UrlDecodeToString(data);
  if (!json) return null;

  try {
    const payload = JSON.parse(json) as Partial<AdminSessionPayload>;
    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.memberId !== "string" ||
      payload.role !== "ADMIN" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) return null;
    return payload as AdminSessionPayload;
  } catch {
    return null;
  }
}
