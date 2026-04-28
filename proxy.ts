import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveLocationSlugFromHost } from "@/lib/host-subdomain";
import {
  getAdminCookieName,
  verifyAdminSessionTokenEdge,
} from "@/lib/admin-session-edge";

/** Used when host has no usable subdomain (localhost, apex, www, etc.). */
const DEFAULT_LOCATION_SLUG = "malmesbury";

const HEADER_LOCATION_SLUG = "x-location-slug";
const HEADER_APP_SHELL = "x-app-shell";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    process.env.ADMIN_ROUTES_ENABLED === "true"
  ) {
    const token = request.cookies.get(getAdminCookieName())?.value ?? "";
    // Edge runtime: verify using Web Crypto.
    // Proxy may be async.
    return (async () => {
      const session = token ? await verifyAdminSessionTokenEdge(token) : null;
      if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
      return continueProxy(request);
    })();
  }

  return continueProxy(request);
}

function continueProxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host");
  const fromSubdomain = resolveLocationSlugFromHost(host);
  const locationSlug = fromSubdomain ?? DEFAULT_LOCATION_SLUG;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(HEADER_LOCATION_SLUG, locationSlug);
  requestHeaders.set(
    HEADER_APP_SHELL,
    pathname.startsWith("/admin") ? "admin" : "site",
  );

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
