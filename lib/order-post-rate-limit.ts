import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRequestClientIp } from "@/lib/request-ip";

const SCOPE_POST_IP = "orders_post_ip";
const MAX_ORDERS_PER_PHONE_PER_HOUR = 5;
const MAX_POSTS_PER_IP_PER_MINUTE = 10;
const HOUR_MS = 60 * 60 * 1000;
const BUCKET_TTL_MS = 2 * 60 * 1000;

function utcMinuteWindowId(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${y}-${mo}-${day}T${h}:${min}Z`;
}

/**
 * Enforces POST /api/orders limits. Returns a 429 response when exceeded, otherwise null.
 */
export async function orderPostRateLimitResponse(
  request: Request,
  phone: string,
): Promise<NextResponse | null> {
  const hourAgo = new Date(Date.now() - HOUR_MS);
  const recentForPhone = await prisma.order.count({
    where: {
      createdAt: { gte: hourAgo },
      customer: { phone },
    },
  });
  if (recentForPhone >= MAX_ORDERS_PER_PHONE_PER_HOUR) {
    return NextResponse.json(
      {
        error:
          "Too many orders for this phone number in the last hour. Please try again later.",
      },
      { status: 429 },
    );
  }

  const ip = getRequestClientIp(request);
  const windowId = utcMinuteWindowId(new Date());
  const expiresAt = new Date(Date.now() + BUCKET_TTL_MS);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.rateLimitBucket.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });

      const row = await tx.rateLimitBucket.upsert({
        where: {
          scope_bucketKey_windowId: {
            scope: SCOPE_POST_IP,
            bucketKey: ip,
            windowId,
          },
        },
        create: {
          scope: SCOPE_POST_IP,
          bucketKey: ip,
          windowId,
          count: 1,
          expiresAt,
        },
        update: { count: { increment: 1 } },
      });

      if (row.count > MAX_POSTS_PER_IP_PER_MINUTE) {
        await tx.rateLimitBucket.update({
          where: { id: row.id },
          data: { count: { decrement: 1 } },
        });
        throw new RateLimitIpError();
      }
    });
  } catch (err) {
    if (err instanceof RateLimitIpError) {
      return NextResponse.json(
        {
          error:
            "Too many order requests from this address. Please wait a minute and try again.",
        },
        { status: 429 },
      );
    }
    throw err;
  }

  return null;
}

class RateLimitIpError extends Error {
  constructor() {
    super("IP rate limit");
    this.name = "RateLimitIpError";
  }
}
