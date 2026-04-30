"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { StickerGeneratorModal } from "@/components/StickerGeneratorModal";
import {
  Card,
  CardTitle,
  DashboardPage,
  FullBleed,
  Kpi,
  KpiLabel,
  KpiValue,
  Muted,
  PageHeader,
  PageSubtitle,
  PageTitle,
  SecondaryLink,
  StorePrimaryLink,
  ActionsRow,
  formatCurrencyZar,
} from "@/components/account/ui";
import { useLanguage } from "@/lib/useLanguage";
import { loadStoredSession, type StoredSession } from "@/lib/session-storage";
import { useResolvedLocationSlug } from "@/lib/useResolvedLocationSlug";

type StoreDashboardResponse = {
  store: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    brandColor: string;
    logoUrl: string | null;
    description: string | null;
    phoneNumber: string | null;
  };
  stats: {
    productsCount: number;
    ordersCount: number;
    recentSales: number;
    recentSalesDays: number;
  };
  productsPreview: {
    id: string;
    title: string;
    price: number;
    unit?: string;
    image?: string;
  }[];
  ordersPreview: {
    id: string;
    createdAt: string;
    status: string;
    customerName: string;
    customerPhone: string;
    total: number;
    items: { name: string; quantity: number }[];
  }[];
};

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
`;

const StoreBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const Logo = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  object-fit: cover;
  flex-shrink: 0;
`;

const FallbackLogo = styled.div<{ $color: string }>`
  width: 52px;
  height: 52px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: ${({ $color }) => $color};
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.03);
  flex-shrink: 0;
`;

const StoreName = styled.div`
  font-weight: 800;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.colors.textDark};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StoreMeta = styled.div`
  margin-top: 6px;
  font-size: 0.85rem;
  color: #777;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const PreviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProductRow = styled.div`
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #ffffff;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #e5e5e5;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }
`;

const Thumb = styled.div`
  width: 56px;
  aspect-ratio: 4 / 5;
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ProdTitle = styled.div`
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.15;
`;

const ProdMeta = styled.div`
  margin-top: 6px;
  font-size: 0.85rem;
  color: #777;
`;

const Price = styled.div`
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`;

const OrderRow = styled.div`
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #ffffff;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #e5e5e5;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }
`;

const OrderTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: baseline;
  flex-wrap: wrap;
`;

const OrderCustomer = styled.div`
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textDark};
`;

const OrderMeta = styled.div`
  margin-top: 6px;
  font-size: 0.85rem;
  color: #777;
`;

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

function isStoreDashboardResponse(
  value: unknown,
): value is StoreDashboardResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!v.store || typeof v.store !== "object") return false;
  if (!v.stats || typeof v.stats !== "object") return false;
  if (!Array.isArray(v.productsPreview)) return false;
  if (!Array.isArray(v.ordersPreview)) return false;
  return true;
}

function storePublicUrl(
  s: Pick<StoreDashboardResponse["store"], "slug" | "id">,
  locationSlug: string | null,
) {
  return locationSlug ? `/${locationSlug}/store/${s.slug}--${s.id}` : "/";
}

export default function AccountSingleStorePage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);
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
  const [data, setData] = useState<StoreDashboardResponse | null>(null);
  const [stickerOpen, setStickerOpen] = useState(false);

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
          `/api/account/store-dashboard?storeId=${encodeURIComponent(storeId)}${locationQuery}`,
          { cache: "no-store" },
        );
        const json: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            json &&
            typeof json === "object" &&
            "error" in json &&
            typeof (json as { error?: unknown }).error === "string"
              ? (json as { error: string }).error
              : t("errUnknown");
          throw new Error(msg);
        }
        if (!isStoreDashboardResponse(json))
          throw new Error(t("errInvalidServerResponse"));
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("errUnknown"));
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootstrapped, locationQuery, storeId, session, t]);

  if (!bootstrapped || !session) {
    return (
      <FullBleed>
        <DashboardPage>
          <PageHeader>
            <PageTitle>Store</PageTitle>
            <PageSubtitle>Sign in to manage this store.</PageSubtitle>
          </PageHeader>
          <Card>
            <CardTitle>{t("signInTitle")}</CardTitle>
            <Muted style={{ marginBottom: 12 }}>
              {t("accountStoredOnDevice")}
            </Muted>
            <Link href="/account">Back to dashboard</Link>
          </Card>
        </DashboardPage>
      </FullBleed>
    );
  }

  const store = data?.store ?? null;
  const stats = data?.stats ?? null;

  return (
    <FullBleed>
      <DashboardPage>
        <PageHeader>
          <PageTitle>{store ? store.name : "Store dashboard"}</PageTitle>
          <PageSubtitle>
            <Link href="/account/stores">Back to stores</Link>
          </PageSubtitle>
        </PageHeader>

        {loading ? <Muted>{t("loading")}</Muted> : null}
        {error ? <Muted role="alert">{error}</Muted> : null}

        {store && stats ? (
          <>
            {/*
              TS: `data` can be null even when `store && stats` is true.
              This block only renders once the fetch payload is present.
            */}
            {(() => {
              const d = data;
              if (!d) return null;
              return (
                <>
                  <Card>
                    <HeaderRow>
                      <StoreBadge>
                        {store.logoUrl ? (
                          <Logo
                            src={store.logoUrl}
                            alt={`${store.name} logo`}
                          />
                        ) : (
                          <FallbackLogo
                            $color={store.brandColor || "#2E5E3E"}
                            aria-hidden
                          />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <StoreName>{store.name}</StoreName>
                          <StoreMeta>
                            {store.isActive ? "Active" : "Inactive"} •{" "}
                            {storePublicUrl(store, location)}
                          </StoreMeta>
                        </div>
                      </StoreBadge>

                      <ActionsRow style={{ marginTop: 0 }}>
                        <SecondaryLink
                          href={`/account/stores/${encodeURIComponent(store.id)}/edit`}
                        >
                          Edit store
                        </SecondaryLink>
                        <SecondaryLink href={storePublicUrl(store, location)}>
                          View store
                        </SecondaryLink>
                        <StorePrimaryLink
                          href="#"
                          $color={store.brandColor || "#2E5E3E"}
                          onClick={(e) => {
                            e.preventDefault();
                            setStickerOpen(true);
                          }}
                        >
                          Generate sticker
                        </StorePrimaryLink>
                      </ActionsRow>
                    </HeaderRow>
                  </Card>

                  <Card>
                    <CardTitle>Stats</CardTitle>
                    <StatsRow>
                      <Kpi>
                        <KpiLabel>Products</KpiLabel>
                        <KpiValue>{stats.productsCount}</KpiValue>
                      </Kpi>
                      <Kpi>
                        <KpiLabel>Orders</KpiLabel>
                        <KpiValue>{stats.ordersCount}</KpiValue>
                      </Kpi>
                      <Kpi>
                        <KpiLabel>
                          Recent sales ({stats.recentSalesDays}d)
                        </KpiLabel>
                        <KpiValue>
                          {formatCurrencyZar(stats.recentSales)}
                        </KpiValue>
                      </Kpi>
                    </StatsRow>
                  </Card>

                  <Card>
                    <CardTitle>Products</CardTitle>
                    {d.productsPreview.length === 0 ? (
                      <Muted>No products yet.</Muted>
                    ) : (
                      <PreviewList>
                        {d.productsPreview.map((p) => (
                          <ProductRow key={p.id}>
                            <Thumb aria-hidden={!p.image}>
                              {p.image ? (
                                <ThumbImg src={p.image} alt={p.title} />
                              ) : null}
                            </Thumb>
                            <div style={{ minWidth: 0 }}>
                              <ProdTitle>{p.title}</ProdTitle>
                              <ProdMeta>
                                {formatCurrencyZar(p.price)}
                                {p.unit ? ` • ${p.unit}` : ""}
                              </ProdMeta>
                            </div>
                            <Price>{formatCurrencyZar(p.price)}</Price>
                          </ProductRow>
                        ))}
                      </PreviewList>
                    )}

                    <ActionsRow>
                      <StorePrimaryLink
                        href={`/account/stores/${encodeURIComponent(store.id)}/products`}
                        $color={store.brandColor || "#2E5E3E"}
                      >
                        Manage products
                      </StorePrimaryLink>
                    </ActionsRow>
                  </Card>

                  <Card>
                    <CardTitle>Recent Orders</CardTitle>
                    {d.ordersPreview.length === 0 ? (
                      <Muted>No orders yet.</Muted>
                    ) : (
                      <PreviewList>
                        {d.ordersPreview.map((o) => (
                          <OrderRow key={o.id}>
                            <OrderTop>
                              <OrderCustomer>{o.customerName}</OrderCustomer>
                              <div
                                style={{ fontWeight: 950, color: "#2E5E3E" }}
                              >
                                {formatCurrencyZar(o.total)}
                              </div>
                            </OrderTop>
                            <OrderMeta>
                              {formatWhen(o.createdAt)} • {o.status}
                            </OrderMeta>
                          </OrderRow>
                        ))}
                      </PreviewList>
                    )}

                    <ActionsRow>
                      <SecondaryLink href="/account/orders">
                        View all orders
                      </SecondaryLink>
                    </ActionsRow>
                  </Card>

                  <StickerGeneratorModal
                    open={stickerOpen}
                    onClose={() => setStickerOpen(false)}
                    store={{
                      name: store.name,
                      slug: store.slug,
                      brandColor: store.brandColor,
                      logoUrl: store.logoUrl,
                      description: store.description,
                      phoneNumber: store.phoneNumber,
                      locationSlug: location,
                    }}
                  />
                </>
              );
            })()}
          </>
        ) : null}
      </DashboardPage>
    </FullBleed>
  );
}
