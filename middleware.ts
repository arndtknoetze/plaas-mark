import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveLocationSlugFromHost } from "@/lib/host-subdomain";

/** Used when host has no usable subdomain (localhost, apex, www, etc.). */
const DEFAULT_LOCATION_SLUG = "malmesbury";

const HEADER_LOCATION_SLUG = "x-location-slug";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const fromSubdomain = resolveLocationSlugFromHost(host);
  const locationSlug = fromSubdomain ?? DEFAULT_LOCATION_SLUG;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(HEADER_LOCATION_SLUG, locationSlug);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
