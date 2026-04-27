import { siteDomain } from "@/lib/host-subdomain";

type HeaderGet = Pick<Headers, "get">;

/**
 * Builds the homepage URL for a tenant subdomain (production or *.localhost dev).
 */
export function buildLocationEntryUrl(
  slug: string,
  headerList: HeaderGet,
): string {
  const hostFull =
    headerList.get("x-forwarded-host")?.trim() ||
    headerList.get("host")?.trim() ||
    "";

  const forwardedProto = headerList
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const proto =
    forwardedProto ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  const lower = hostFull.toLowerCase();
  const colonIdx = lower.lastIndexOf(":");
  const maybePort =
    colonIdx > 0 && /^\d+$/.test(hostFull.slice(colonIdx + 1))
      ? hostFull.slice(colonIdx)
      : "";

  const hostnameOnly =
    maybePort && colonIdx > 0
      ? hostFull.slice(0, colonIdx)
      : hostFull.split(":")[0];

  if (
    hostnameOnly === "localhost" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostnameOnly ?? "")
  ) {
    return `${proto}://${slug}.localhost${maybePort}/`;
  }

  const root = siteDomain();
  return `${proto}://${slug}.${root}/`;
}
