import { prisma } from "@/lib/db";
import { AnalyticsDashboard } from "./ui";

export const dynamic = "force-dynamic";

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

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const from = startOfDay(addDays(now, -13)); // 14 days incl today
  const to = addDays(startOfDay(now), 1);

  const [events, sessions, stores, recent] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: from, lt: to } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        type: true,
        path: true,
        storeId: true,
        createdAt: true,
        deviceType: true,
        isMobile: true,
        isBot: true,
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
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: from, lt: to } },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        createdAt: true,
        type: true,
        path: true,
        storeId: true,
        deviceType: true,
        isMobile: true,
        isBot: true,
        browserName: true,
        osName: true,
      },
    }),
  ]);

  const storeNameById = new Map(stores.map((s) => [s.id, s.name]));

  const days: { date: string; events: number; bot: number }[] = [];
  const dayIndex = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const k = dayKey(addDays(from, i));
    dayIndex.set(k, i);
    days.push({ date: k, events: 0, bot: 0 });
  }

  const pathCounts = new Map<string, number>();
  const storeCounts = new Map<string, number>();
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

  return (
    <AnalyticsDashboard
      snapshot={{
        range: { from: from.toISOString(), to: to.toISOString() },
        totals: {
          events: events.length,
          sessions,
          bots,
          mobile,
          desktop,
        },
        series: { days },
        top: { paths: topPaths, stores: topStores, devices },
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
          deviceType: e.deviceType ?? "unknown",
          isMobile: Boolean(e.isMobile),
          isBot: Boolean(e.isBot),
          browser: e.browserName ?? null,
          os: e.osName ?? null,
        })),
      }}
    />
  );
}
