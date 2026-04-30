import type { Member } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getUserSessionOrNull } from "@/lib/user-session";

export function normalizeAccountEmail(
  value: string | null | undefined,
): string {
  return (value ?? "").trim().toLowerCase();
}

export function normalizeAccountPhone(
  value: string | null | undefined,
): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Resolves the Member for account APIs: prefers signed-in cookie, then
 * `email` / `phone` on the request URL, then optional explicit credentials.
 */
export async function resolveAccountMember(
  request: Request,
  creds?: { phone?: string; email?: string },
): Promise<Member | null> {
  const sess = await getUserSessionOrNull();
  if (sess?.memberId) {
    const m = await prisma.member.findUnique({ where: { id: sess.memberId } });
    if (m) return m;
  }

  const url = new URL(request.url);
  const email =
    creds?.email !== undefined
      ? normalizeAccountEmail(creds.email)
      : normalizeAccountEmail(url.searchParams.get("email"));
  const phone =
    creds?.phone !== undefined
      ? normalizeAccountPhone(creds.phone)
      : normalizeAccountPhone(url.searchParams.get("phone"));

  if (email) {
    const m = await prisma.member.findUnique({ where: { email } });
    if (m) return m;
  }
  if (phone) {
    return prisma.member.findUnique({ where: { phone } });
  }
  return null;
}
