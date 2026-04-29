"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AccountOtpForm } from "@/components/AccountOtpForm";
import {
  Card,
  CardTitle,
  DashboardPage,
  FullBleed,
  Kpi,
  KpiGrid,
  KpiLabel,
  KpiValue,
  Muted,
  PageHeader,
  PageSubtitle,
  PageTitle,
  PrimaryLink,
  SecondaryLink,
  ActionsRow,
  formatCurrencyZar,
} from "@/components/account/ui";
import { useLanguage } from "@/lib/useLanguage";
import { loadStoredSession, type StoredSession } from "@/lib/session-storage";
import { useResolvedLocationSlug } from "@/lib/useResolvedLocationSlug";

type SummaryResponse = {
  counts: { stores: number; products: number; orders: number };
  recentOrders: {
    id: string;
    createdAt: string;
    status: string;
    customerName: string;
    total: number;
    itemsCount: number;
  }[];
};

type AnalyticsResponse = {
  stores: { id: string; name: string; brandColor: string }[];
  salesMonths: string[];
  salesByStore: Record<string, Record<string, number>>;
  visitsLast30Days: {
    storeId: string;
    storeName: string;
    brandColor: string;
    visits: number;
  }[];
};

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 980px) {
    grid-template-columns: 1.1fr 0.9fr;
    align-items: start;
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OrderItem = styled(Link)`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #ffffff;
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #e5e5e5;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const OrderMain = styled.div`
  min-width: 0;
`;

const OrderTop = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
`;

const OrderCustomer = styled.div`
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textDark};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OrderMeta = styled.div`
  margin-top: 6px;
  font-size: 0.85rem;
  color: #777;
`;

const OrderAmount = styled.div`
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`;

const ChartWrap = styled.div`
  width: 100%;
  height: 280px;
`;

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return `${m}/${String(y).slice(-2)}`;
}

function isAnalyticsResponse(value: unknown): value is AnalyticsResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.stores)) return false;
  if (!Array.isArray(v.salesMonths)) return false;
  if (!v.salesByStore || typeof v.salesByStore !== "object") return false;
  if (!Array.isArray(v.visitsLast30Days)) return false;
  return true;
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function isSummaryResponse(value: unknown): value is SummaryResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const counts = v.counts as Record<string, unknown> | undefined;
  if (!counts) return false;
  if (
    typeof counts.stores !== "number" ||
    typeof counts.products !== "number" ||
    typeof counts.orders !== "number"
  ) {
    return false;
  }
  if (!Array.isArray(v.recentOrders)) return false;
  return true;
}

export default function AccountDashboardPage() {
  const { t } = useLanguage();
  const location = useResolvedLocationSlug();
  const locationQuery = useMemo(
    () => (location ? `&location=${encodeURIComponent(location)}` : ""),
    [location],
  );

  const [bootstrapped, setBootstrapped] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setSession(loadStoredSession());
      setBootstrapped(true);
    });
  }, []);

  useEffect(() => {
    if (!bootstrapped || !session) return;
    let cancelled = false;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch(
          `/api/account/summary?phone=${encodeURIComponent(session.phone)}${locationQuery}`,
          { cache: "no-store" },
        );
        const data: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof (data as { error?: unknown }).error === "string"
              ? (data as { error: string }).error
              : t("errUnknown");
          throw new Error(msg);
        }
        if (!isSummaryResponse(data))
          throw new Error(t("errInvalidServerResponse"));
        if (!cancelled) setSummary(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("errUnknown"));
          setSummary(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootstrapped, locationQuery, session, t]);

  useEffect(() => {
    if (!bootstrapped || !session?.phone) return;
    let cancelled = false;
    (async () => {
      setLoadingAnalytics(true);
      try {
        const res = await fetch(
          `/api/account/analytics?phone=${encodeURIComponent(session.phone)}${locationQuery}`,
          { cache: "no-store" },
        );
        const data: unknown = await res.json().catch(() => null);
        if (!res.ok) throw new Error("Could not load analytics.");
        if (!isAnalyticsResponse(data)) throw new Error("Invalid response.");
        if (!cancelled) setAnalytics(data);
      } catch {
        if (!cancelled) setAnalytics(null);
      } finally {
        if (!cancelled) setLoadingAnalytics(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootstrapped, locationQuery, session?.phone]);

  const counts = summary?.counts ?? { stores: 0, products: 0, orders: 0 };

  const salesSeriesStores = useMemo(() => {
    if (!analytics || analytics.stores.length === 0) return [];
    const totalByStore = analytics.stores.map((s) => {
      const months = analytics.salesByStore[s.id] ?? {};
      const total = Object.values(months).reduce((sum, v) => sum + (v || 0), 0);
      return { ...s, total };
    });
    return totalByStore.sort((a, b) => b.total - a.total).slice(0, 5);
  }, [analytics]);

  const salesChartData = useMemo(() => {
    const salesMonths = analytics?.salesMonths ?? [];
    const salesByStore = analytics?.salesByStore ?? {};
    if (salesMonths.length === 0 || salesSeriesStores.length === 0) return [];
    return salesMonths.map((k) => {
      const row: Record<string, unknown> = { month: monthLabel(k) };
      for (const s of salesSeriesStores) {
        row[s.id] = salesByStore[s.id]?.[k] ?? 0;
      }
      return row;
    });
  }, [analytics, salesSeriesStores]);

  const visitsChartData = useMemo(() => {
    const visits = analytics?.visitsLast30Days ?? [];
    return visits.slice(0, 8).map((v) => ({
      name:
        v.storeName.length > 14 ? `${v.storeName.slice(0, 14)}…` : v.storeName,
      visits: v.visits,
      color: v.brandColor || "#2E5E3E",
    }));
  }, [analytics]);

  if (!bootstrapped || !session) {
    return (
      <FullBleed>
        <DashboardPage>
          <PageHeader>
            <PageTitle>{t("account")}</PageTitle>
            <PageSubtitle>{t("activitySignInPrompt")}</PageSubtitle>
          </PageHeader>

          <Card>
            <CardTitle>{t("signInTitle")}</CardTitle>
            <Muted style={{ marginBottom: 12 }}>
              {t("accountStoredOnDevice")}
            </Muted>
            <AccountOtpForm onSuccess={() => setSession(loadStoredSession())} />
          </Card>
        </DashboardPage>
      </FullBleed>
    );
  }

  return (
    <FullBleed>
      <DashboardPage>
        <PageHeader>
          <PageTitle>{t("dashboardTitle")}</PageTitle>
          <PageSubtitle>
            {t("helloManageStores", { name: session.name })}
          </PageSubtitle>
        </PageHeader>

        <Row>
          <Card>
            <CardTitle>Stats</CardTitle>
            <KpiGrid>
              <Kpi>
                <KpiLabel>Total stores</KpiLabel>
                <KpiValue>{counts.stores}</KpiValue>
              </Kpi>
              <Kpi>
                <KpiLabel>Total products</KpiLabel>
                <KpiValue>{counts.products}</KpiValue>
              </Kpi>
              <Kpi>
                <KpiLabel>Total orders</KpiLabel>
                <KpiValue>{counts.orders}</KpiValue>
              </Kpi>
            </KpiGrid>

            <ActionsRow>
              <PrimaryLink href="/begin-verkoop">
                {t("createNewStore")}
              </PrimaryLink>
              <SecondaryLink href="/account/stores">View stores</SecondaryLink>
              <SecondaryLink href="/account/orders">
                {t("storeOrders")}
              </SecondaryLink>
            </ActionsRow>
          </Card>

          <Card>
            <CardTitle>Recent Orders</CardTitle>
            {loading ? <Muted>{t("loading")}</Muted> : null}
            {error ? <Muted role="alert">{error}</Muted> : null}

            {!loading &&
            !error &&
            summary &&
            summary.recentOrders.length === 0 ? (
              <Muted>No orders yet.</Muted>
            ) : null}

            {!loading &&
            !error &&
            summary &&
            summary.recentOrders.length > 0 ? (
              <OrdersList>
                {summary.recentOrders.slice(0, 5).map((o) => (
                  <OrderItem key={o.id} href="/account/orders">
                    <OrderMain>
                      <OrderTop>
                        <OrderCustomer>{o.customerName}</OrderCustomer>
                      </OrderTop>
                      <OrderMeta>
                        {formatWhen(o.createdAt)} • {o.status} • {o.itemsCount}{" "}
                        items
                      </OrderMeta>
                    </OrderMain>
                    <OrderAmount>{formatCurrencyZar(o.total)}</OrderAmount>
                  </OrderItem>
                ))}
              </OrdersList>
            ) : null}
          </Card>
        </Row>

        <Row>
          <Card>
            <CardTitle>Sales (last 12 months)</CardTitle>
            {loadingAnalytics ? <Muted>Loading analytics…</Muted> : null}
            {!loadingAnalytics &&
            (!analytics || salesSeriesStores.length === 0) ? (
              <Muted>Not enough data yet.</Muted>
            ) : null}
            {!loadingAnalytics && analytics && salesSeriesStores.length > 0 ? (
              <ChartWrap>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesChartData}
                    margin={{ left: 8, right: 8 }}
                  >
                    <CartesianGrid stroke="#eee" vertical={false} />
                    <XAxis dataKey="month" tickMargin={10} stroke="#777" />
                    <YAxis
                      tickMargin={10}
                      stroke="#777"
                      tickFormatter={(v) => `R ${Number(v).toFixed(0)}`}
                    />
                    <Tooltip
                      formatter={(v) =>
                        typeof v === "number" ? formatCurrencyZar(v) : v
                      }
                    />
                    {salesSeriesStores.map((s) => (
                      <Line
                        key={s.id}
                        type="monotone"
                        dataKey={s.id}
                        name={s.name}
                        stroke={s.brandColor || "#2E5E3E"}
                        strokeWidth={2.25}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </ChartWrap>
            ) : null}
            <Muted>
              Showing up to {salesSeriesStores.length} stores (top by sales).
            </Muted>
          </Card>

          <Card>
            <CardTitle>Store page visits (30 days)</CardTitle>
            {loadingAnalytics ? <Muted>Loading analytics…</Muted> : null}
            {!loadingAnalytics &&
            (!analytics || (analytics.visitsLast30Days?.length ?? 0) === 0) ? (
              <Muted>No visits yet.</Muted>
            ) : null}
            {!loadingAnalytics &&
            analytics &&
            (analytics.visitsLast30Days?.length ?? 0) > 0 ? (
              <ChartWrap>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={visitsChartData}
                    margin={{ left: 8, right: 8 }}
                  >
                    <CartesianGrid stroke="#eee" vertical={false} />
                    <XAxis dataKey="name" tickMargin={10} stroke="#777" />
                    <YAxis
                      tickMargin={10}
                      stroke="#777"
                      allowDecimals={false}
                    />
                    <Tooltip />
                    <Bar dataKey="visits" radius={[8, 8, 0, 0]}>
                      {visitsChartData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartWrap>
            ) : null}
            {!loadingAnalytics &&
            analytics &&
            (analytics.visitsLast30Days?.length ?? 0) > 0 ? (
              <ActionsRow>
                <SecondaryLink href="/account/stores">
                  View stores
                </SecondaryLink>
              </ActionsRow>
            ) : null}
          </Card>
        </Row>
      </DashboardPage>
    </FullBleed>
  );
}
