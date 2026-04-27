/**
 * Shared hostname → tenant slug rules (middleware + homepage branch).
 */

export function siteDomain(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim();
  return raw ? raw.toLowerCase() : "plaasmark.co.za";
}

/**
 * Returns the first DNS label when the host is a tenant subdomain;
 * otherwise null (apex, www, bare localhost, LAN IP, unknown).
 */
export function resolveLocationSlugFromHost(
  hostHeader: string | null,
): string | null {
  if (!hostHeader) return null;

  const hostnameFull = hostHeader.split(":")[0]?.trim().toLowerCase() ?? "";
  if (!hostnameFull) return null;

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostnameFull)) return null;

  if (hostnameFull.endsWith(".localhost")) {
    const sub = hostnameFull.slice(0, -".localhost".length);
    if (!sub || sub === "www" || sub.includes(".")) return null;
    return sub;
  }

  if (hostnameFull === "localhost") return null;

  const root = siteDomain();
  if (hostnameFull === root || hostnameFull === `www.${root}`) return null;

  const suffix = `.${root}`;
  if (hostnameFull.endsWith(suffix)) {
    const sub = hostnameFull.slice(0, -suffix.length);
    if (!sub || sub === "www") return null;
    if (sub.includes(".")) return null;
    return sub;
  }

  return null;
}
