import { prisma } from "@/lib/db";
import { AnalyticsDashboard } from "./ui";

export const dynamic = "force-dynamic";
const RECENT_PAGE_SIZE = 100;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const now = new Date();
  const from = startOfDay(addDays(now, -13)); // 14 days incl today
  const to = addDays(startOfDay(now), 1);
  const sp = (await searchParams) ?? {};
  const recentPageRaw = Array.isArray(sp.recentPage)
    ? sp.recentPage[0]
    : sp.recentPage;
  const recentPageNum = Number(recentPageRaw);
  const recentPage =
    Number.isFinite(recentPageNum) && recentPageNum > 0
      ? Math.floor(recentPageNum)
      : 1;

  const [events, sessions, stores, locations, recentTotal] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: from, lt: to } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        type: true,
        path: true,
        storeId: true,
        locationId: true,
        createdAt: true,
        deviceType: true,
        isMobile: true,
        isBot: true,
        session: {
          select: {
            memberId: true,
          },
        },
      },
      take: 10_000,
    }),
    prisma.analyticsSession.count({
      where: { createdAt: { gte: from, lt: to } },
    }),
    prisma.store.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.analyticsEvent.count({
      where: { createdAt: { gte: from, lt: to } },
    }),
  ]);
  const recentTotalPages = Math.max(
    1,
    Math.ceil(recentTotal / RECENT_PAGE_SIZE),
  );
  const safeRecentPage = Math.min(recentPage, recentTotalPages);
  const recent = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: from, lt: to } },
    orderBy: { createdAt: "desc" },
    skip: (safeRecentPage - 1) * RECENT_PAGE_SIZE,
    take: RECENT_PAGE_SIZE,
    select: {
      id: true,
      createdAt: true,
      type: true,
      path: true,
      storeId: true,
      locationId: true,
      deviceType: true,
      isMobile: true,
      isBot: true,
      browserName: true,
      osName: true,
      session: {
        select: {
          memberId: true,
        },
      },
    },
  });

  const storeNameById = new Map(stores.map((s) => [s.id, s.name]));
  const locationById = new Map(
    locations.map((l) => [l.id, { name: l.name, slug: l.slug }]),
  );
  const recentMemberIds = Array.from(
    new Set(
      recent
        .map((event) => event.session.memberId)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const recentMembers =
    recentMemberIds.length > 0
      ? await prisma.member.findMany({
          where: { id: { in: recentMemberIds } },
          select: { id: true, name: true, phone: true },
        })
      : [];
  const memberById = new Map(
    recentMembers.map((m) => [m.id, { name: m.name, phone: m.phone }]),
  );

  const days: { date: string; events: number; bot: number }[] = [];
  const dayIndex = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const k = dayKey(addDays(from, i));
    dayIndex.set(k, i);
    days.push({ date: k, events: 0, bot: 0 });
  }

  const pathCounts = new Map<string, number>();
  const storeCounts = new Map<string, number>();
  const locationCounts = new Map<string, number>();
  const memberCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  let mobile = 0;
  let desktop = 0;
  let bots = 0;

  for (const e of events) {
    const k = dayKey(e.createdAt);
    const idx = dayIndex.get(k);
    if (idx !== undefined) {
      days[idx].events += 1;
      if (e.isBot) days[idx].bot += 1;
    }

    if (e.isBot) bots += 1;
    if (e.isMobile) mobile += 1;
    else desktop += 1;

    const path = e.path || "/";
    pathCounts.set(path, (pathCounts.get(path) ?? 0) + 1);

    if (e.storeId) {
      storeCounts.set(e.storeId, (storeCounts.get(e.storeId) ?? 0) + 1);
    }
    if (e.locationId) {
      locationCounts.set(
        e.locationId,
        (locationCounts.get(e.locationId) ?? 0) + 1,
      );
    }
    if (e.session.memberId) {
      memberCounts.set(
        e.session.memberId,
        (memberCounts.get(e.session.memberId) ?? 0) + 1,
      );
    }

    const device = e.deviceType || "unknown";
    deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1);
  }

  const topPaths = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, count]) => ({ path, count }));

  const topStores = [...storeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([storeId, count]) => ({
      storeId,
      name: storeNameById.get(storeId) ?? storeId.slice(0, 8),
      count,
    }));

  const devices = [...deviceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  const topLocations = [...locationCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([locationId, count]) => {
      const location = locationById.get(locationId);
      return {
        locationId,
        name: location?.name ?? locationId.slice(0, 8),
        slug: location?.slug ?? null,
        count,
      };
    });

  const topMembers = [...memberCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([memberId, count]) => {
      const member = memberById.get(memberId);
      return {
        memberId,
        name: member?.name ?? "Unknown member",
        phone: member?.phone ?? null,
        count,
      };
    });

  return (
    <AnalyticsDashboard
      snapshot={{
        range: { from: from.toISOString(), to: to.toISOString() },
        totals: {
          events: events.length,
          sessions,
          loggedInEvents: [...memberCounts.values()].reduce(
            (sum, n) => sum + n,
            0,
          ),
          bots,
          mobile,
          desktop,
        },
        series: { days },
        top: {
          paths: topPaths,
          stores: topStores,
          devices,
          locations: topLocations,
          members: topMembers,
        },
        recent: recent.map((e) => ({
          id: e.id,
          createdAt: e.createdAt.toISOString(),
          type: e.type,
          path: e.path ?? "/",
          store:
            e.storeId && storeNameById.has(e.storeId)
              ? {
                  id: e.storeId,
                  name: storeNameById.get(e.storeId) ?? e.storeId,
                }
              : e.storeId
                ? { id: e.storeId, name: e.storeId.slice(0, 8) }
                : null,
          location:
            e.locationId && locationById.has(e.locationId)
              ? {
                  id: e.locationId,
                  name: locationById.get(e.locationId)?.name ?? e.locationId,
                  slug: locationById.get(e.locationId)?.slug ?? null,
                }
              : e.locationId
                ? {
                    id: e.locationId,
                    name: e.locationId.slice(0, 8),
                    slug: null,
                  }
                : null,
          member:
            e.session.memberId && memberById.has(e.session.memberId)
              ? {
                  id: e.session.memberId,
                  name:
                    memberById.get(e.session.memberId)?.name ??
                    e.session.memberId,
                  phone: memberById.get(e.session.memberId)?.phone ?? null,
                }
              : e.session.memberId
                ? {
                    id: e.session.memberId,
                    name: "Unknown member",
                    phone: null,
                  }
                : null,
          deviceType: e.deviceType ?? "unknown",
          isMobile: Boolean(e.isMobile),
          isBot: Boolean(e.isBot),
          browser: e.browserName ?? null,
          os: e.osName ?? null,
        })),
        recentPagination: {
          page: safeRecentPage,
          perPage: RECENT_PAGE_SIZE,
          total: recentTotal,
          totalPages: recentTotalPages,
        },
      }}
    />
  );
}
