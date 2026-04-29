/**
 * HMAC secret for signed cookies (site user + admin sessions).
 * Prefer `SESSION_SECRET`; `ADMIN_SESSION_SECRET` remains for backwards compatibility.
 */
export function getSessionSigningSecret(): string {
  return (
    process.env.SESSION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    ""
  );
}
