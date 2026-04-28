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

  const forwardedHeader = headerList.get("forwarded") ?? "";
  const forwardedProto =
    forwardedHeader.match(/(?:^|;|,)\s*proto=([^;,\s]+)/i)?.[1]?.trim() ||
    headerList.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    headerList.get("x-forwarded-protocol")?.split(",")[0]?.trim() ||
    headerList.get("x-url-scheme")?.trim() ||
    "";

  if (
    hostnameOnly === "localhost" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostnameOnly ?? "")
  ) {
    const proto =
      forwardedProto ||
      (process.env.NODE_ENV === "production" ? "https" : "http");
    return `${proto}://${slug}.localhost${maybePort}/`;
  }

  // In production, always emit https links for real domains even if an upstream
  // proxy misreports `x-forwarded-proto` as http.
  const proto =
    process.env.NODE_ENV === "production" ? "https" : forwardedProto || "http";
  const root = siteDomain();
  return `${proto}://${slug}.${root}/`;
}
