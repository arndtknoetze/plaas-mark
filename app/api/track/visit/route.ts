import { NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import { createHash, randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { getLocationFromRequest } from "@/lib/location";
import {
  getAdminCookieName,
  verifyAdminSessionToken,
} from "@/lib/admin-session";
import { getUserCookieName, verifyUserSessionToken } from "@/lib/user-session";

const ANON_COOKIE = "plaasmark-anon";

type Body = {
  path?: unknown;
  referrer?: unknown;
  locale?: unknown;
  props?: unknown;
};

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function isAnalyticsSuppressedForPhone(phone: string | null | undefined) {
  if (!phone) return false;
  return normalizePhone(phone) === "0724592879";
}

function readClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || null;
}

function hashIp(ip: string): string {
  const salt = process.env.ANALYTICS_IP_SALT ?? "";
  return createHash("sha256").update(`${salt}${ip}`).digest("hex").slice(0, 32);
}

function isProbablyBot(userAgent: string): boolean {
  return /(bot|crawler|spider|crawling|slurp|facebookexternalhit|whatsapp)/i.test(
    userAgent,
  );
}

function getOrCreateAnonId(request: Request): {
  anonId: string;
  isNew: boolean;
} {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)plaasmark-anon=([^;]+)/);
  const raw = match?.[1]?.trim() ?? "";
  if (raw) return { anonId: raw, isNew: false };
  return { anonId: randomUUID(), isNew: true };
}

function readCookieValue(cookieHeader: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]+)`));
  return match?.[1]?.trim() ?? "";
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const path = typeof body.path === "string" ? body.path.trim() : "";
  if (!path || path.length > 2048) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  const referrer =
    typeof body.referrer === "string" ? body.referrer.trim() : undefined;
  const locale =
    typeof body.locale === "string" ? body.locale.trim() : undefined;

  const userAgent = request.headers.get("user-agent") ?? "";
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const deviceType =
    typeof result.device.type === "string" ? result.device.type : "desktop";
  const isMobile = deviceType === "mobile" || deviceType === "tablet";

  const ip = readClientIp(request);
  const ipHash = ip ? hashIp(ip) : undefined;

  const { anonId, isNew } = getOrCreateAnonId(request);
  const cookieHeader = request.headers.get("cookie") ?? "";
  const userToken = readCookieValue(cookieHeader, getUserCookieName());
  const userSession = userToken ? verifyUserSessionToken(userToken) : null;
  const adminToken = readCookieValue(cookieHeader, getAdminCookieName());
  const adminSession = adminToken ? verifyAdminSessionToken(adminToken) : null;
  let memberId = userSession?.memberId || adminSession?.memberId || undefined;
  if (memberId) {
    const existingMember = await prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, phone: true },
    });
    if (!existingMember) {
      memberId = undefined;
    } else if (isAnalyticsSuppressedForPhone(existingMember.phone)) {
      return NextResponse.json({ ok: true });
    }
  }

  let locationId: string | undefined;
  try {
    locationId = (await getLocationFromRequest(request)).id;
  } catch {
    locationId = undefined;
  }

  const session = await prisma.analyticsSession.upsert({
    where: { anonId },
    create: { anonId, memberId },
    update: { lastSeenAt: new Date(), ...(memberId ? { memberId } : {}) },
    select: { id: true },
  });

  await prisma.analyticsEvent.create({
    data: {
      sessionId: session.id,
      type: "page_view",
      path,
      referrer: referrer || undefined,
      locale: locale || undefined,
      locationId,
      ipHash,
      userAgent: userAgent || undefined,
      browserName: result.browser.name ?? undefined,
      browserVersion: result.browser.version ?? undefined,
      osName: result.os.name ?? undefined,
      osVersion: result.os.version ?? undefined,
      deviceVendor: result.device.vendor ?? undefined,
      deviceModel: result.device.model ?? undefined,
      deviceType,
      isMobile,
      isBot: userAgent ? isProbablyBot(userAgent) : undefined,
      props:
        body.props && typeof body.props === "object"
          ? (body.props as object)
          : undefined,
    },
  });

  const res = NextResponse.json({ ok: true });
  if (isNew) {
    const maxAge = 60 * 60 * 24 * 365; // 1 year
    res.cookies.set({
      name: ANON_COOKIE,
      value: anonId,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });
  }
  return res;
}
