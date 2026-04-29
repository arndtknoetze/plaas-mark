"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ProductCard } from "@/components/ProductCard";
import { FilterBar } from "@/components/shop/FilterBar";
import { FeaturedProductCard } from "@/components/shop/FeaturedProductCard";
import {
  HorizontalScrollItem,
  HorizontalScrollList,
} from "@/components/shop/HorizontalScrollList";
import { SectionHeader } from "@/components/shop/SectionHeader";
import { StoreCarousel } from "@/components/shop/StoreCarousel";
import { useLanguage } from "@/lib/useLanguage";
import { loadStoredSession } from "@/lib/session-storage";
import type { Product } from "@/types/product";

const Surface = styled.div`
  background: #f5f5f0;
  border-radius: 18px;
  padding: 16px;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 10px 26px rgba(0, 0, 0, 0.06);

  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const Hero = styled.section`
  margin-bottom: 14px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 950;
  letter-spacing: -0.035em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

const HeroSub = styled.p`
  margin: 8px 0 0;
  font-size: 0.98rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

const SectionTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const Message = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textLight};
`;

const AreaHint = styled.p`
  margin: 10px 0 0;
  font-size: 0.9375rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ShopLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 800;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const StorePageHint = styled(Message)`
  margin: -10px 0 8px;
`;

const EmptyCard = styled.section`
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 10px 22px rgba(0, 0, 0, 0.05);
`;

const ResetButton = styled.button`
  width: 100%;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #ffffff;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textDark};
  cursor: pointer;
  transition:
    transform 0.08s ease,
    box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

type StoreOption = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
};

function parseStoresPayload(body: unknown): StoreOption[] {
  if (!body || typeof body !== "object") return [];
  const raw = (body as { stores?: unknown }).stores;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is StoreOption =>
      Boolean(x) &&
      typeof x === "object" &&
      typeof (x as StoreOption).id === "string" &&
      typeof (x as StoreOption).name === "string" &&
      typeof (x as StoreOption).slug === "string",
  );
}

type TopSellerRow = {
  storeId: string;
  storeName: string;
  shopSlug: string;
  unitsSold: number;
};

function parseTopSellersPayload(body: unknown): TopSellerRow[] {
  if (!body || typeof body !== "object") return [];
  const raw = (body as { sellers?: unknown }).sellers;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is TopSellerRow =>
      Boolean(x) &&
      typeof x === "object" &&
      typeof (x as TopSellerRow).storeId === "string" &&
      typeof (x as TopSellerRow).storeName === "string" &&
      typeof (x as TopSellerRow).shopSlug === "string" &&
      typeof (x as TopSellerRow).unitsSold === "number",
  );
}

export default function ShopPageClient({
  locationSlug,
}: {
  locationSlug?: string;
}) {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [topSellers, setTopSellers] = useState<TopSellerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [store, setStore] = useState<string>("all");
  const [areaLabel, setAreaLabel] = useState<string | null>(null);
  const [ownedStoreIds, setOwnedStoreIds] = useState<Set<string> | null>(null);

  const locationQuery = locationSlug
    ? `?location=${encodeURIComponent(locationSlug)}`
    : "";
  const locationPrefix = locationSlug ? `/${locationSlug}` : "";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/location${locationQuery}`);
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok || !body || typeof body !== "object") return;
        const name = (body as { name?: unknown }).name;
        if (typeof name === "string" && !cancelled) setAreaLabel(name);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locationQuery, t]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ownedStoreIds !== null) return;
    const session = loadStoredSession();
    if (!session) {
      /* eslint-disable react-hooks/set-state-in-effect -- initialize from localStorage after mount */
      setOwnedStoreIds(new Set());
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }
    let cancelled = false;
    const url = new URL("/api/stores/my", window.location.origin);
    url.searchParams.set("phone", session.phone);
    if (locationSlug) url.searchParams.set("location", locationSlug);
    fetch(url.toString())
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        const list =
          data && typeof data === "object" && "stores" in data
            ? (data as { stores: unknown }).stores
            : [];
        const ids = Array.isArray(list)
          ? list
              .map((s) =>
                s && typeof s === "object" && "id" in s
                  ? (s as { id?: unknown }).id
                  : null,
              )
              .filter((x): x is string => typeof x === "string")
          : [];
        setOwnedStoreIds(new Set(ids));
      })
      .catch(() => {
        if (!cancelled) setOwnedStoreIds(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, [locationSlug, ownedStoreIds]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [prodRes, storeRes, topRes] = await Promise.all([
          fetch(`/api/products${locationQuery}`),
          fetch(`/api/stores${locationQuery}`),
          fetch(`/api/top-sellers${locationQuery}`).catch(() => null),
        ]);

        const prodBody: unknown = await prodRes.json().catch(() => null);
        const storeBody: unknown = await storeRes.json().catch(() => null);
        const topBody: unknown = topRes
          ? await topRes.json().catch(() => null)
          : null;

        if (!prodRes.ok) {
          const msg =
            prodBody &&
            typeof prodBody === "object" &&
            "error" in prodBody &&
            typeof (prodBody as { error: unknown }).error === "string"
              ? (prodBody as { error: string }).error
              : t("errUnknown");
          throw new Error(msg);
        }

        if (!Array.isArray(prodBody)) {
          throw new Error(t("errInvalidServerResponse"));
        }

        const parsedStores = storeRes.ok ? parseStoresPayload(storeBody) : [];
        const parsedTop =
          topRes && topRes.ok ? parseTopSellersPayload(topBody) : [];

        if (!cancelled) {
          setProducts(prodBody as Product[]);
          setStores(parsedStores);
          setTopSellers(parsedTop);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("errUnknown"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locationQuery, t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (ownedStoreIds && ownedStoreIds.has(p.vendorId)) return false;
      if (store !== "all") {
        if (p.vendorId !== store) return false;
      }
      if (!q) return true;
      const hay = `${p.title} ${p.vendorName ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [ownedStoreIds, products, query, store]);

  const featured = useMemo(() => {
    const isBlocked = (p: Product) =>
      Boolean(ownedStoreIds && ownedStoreIds.has(p.vendorId));
    const pool = products.filter((p) => !isBlocked(p));

    const sellerIds = new Set(topSellers.map((s) => s.storeId));
    const primary = sellerIds.size
      ? pool.filter((p) => sellerIds.has(p.vendorId))
      : pool;

    const out: Product[] = [];
    const seen = new Set<string>();
    for (const p of primary) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
      if (out.length >= 6) break;
    }

    if (out.length < 4) {
      for (const p of pool) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        out.push(p);
        if (out.length >= 6) break;
      }
    }

    return out;
  }, [ownedStoreIds, products, topSellers]);

  const hasStoresOrProducts = stores.length > 0 || products.length > 0;

  return (
    <Surface>
      <Hero>
        <HeroTitle>{t("shop")}</HeroTitle>
        <HeroSub>
          {language === "af"
            ? "Ontdek vars produkte en plaaslike winkels in jou area."
            : "Discover fresh products and local stores in your area."}
        </HeroSub>
        {areaLabel ? (
          <AreaHint>{t("areaLabel", { area: areaLabel })}</AreaHint>
        ) : null}
      </Hero>

      {loading ? (
        <Message>{t("loading")}</Message>
      ) : error ? (
        <Message role="alert">{error}</Message>
      ) : !hasStoresOrProducts ? (
        <Message>{t("noActiveStoresOrProducts")}</Message>
      ) : (
        <Stack>
          <Section aria-label={language === "af" ? "Winkels" : "Stores"}>
            <StoreCarousel
              stores={stores}
              title={language === "af" ? "Winkels naby jou" : "Stores near you"}
              locationSlug={locationSlug}
            />
          </Section>

          <Section aria-label="Filters">
            <FilterBar
              searchLabel={t("searchLabel")}
              searchPlaceholder={t("searchPlaceholder")}
              storeLabel={t("storeFilterLabel")}
              allStoresLabel={t("allStores")}
              query={query}
              onQueryChange={setQuery}
              store={store}
              onStoreChange={setStore}
              stores={stores}
            />

            {store !== "all" ? (
              <StorePageHint>
                {t("viewStorePage")}{" "}
                {(() => {
                  const v = stores.find((x) => x.id === store);
                  return v ? (
                    <ShopLink
                      href={`${locationPrefix}/store/${v.slug}--${encodeURIComponent(v.id)}`}
                    >
                      {locationPrefix}/store/{v.slug}--{v.id}
                    </ShopLink>
                  ) : null;
                })()}
              </StorePageHint>
            ) : null}
          </Section>

          {featured.length > 0 ? (
            <Section
              aria-label={language === "af" ? "Top verkopers" : "Top sellers"}
            >
              <SectionTop>
                <SectionHeader
                  title={language === "af" ? "Top verkopers" : "Top sellers"}
                  actionLabel={
                    language === "af" ? "Sien alle winkels" : "See all stores"
                  }
                  actionHref="/shops"
                />
              </SectionTop>
              <HorizontalScrollList>
                {featured.map((p) => (
                  <HorizontalScrollItem key={p.id}>
                    <FeaturedProductCard product={p} />
                  </HorizontalScrollItem>
                ))}
              </HorizontalScrollList>
            </Section>
          ) : null}

          <Section
            aria-label={language === "af" ? "Alle produkte" : "All products"}
          >
            <SectionTop>
              <SectionHeader
                title={language === "af" ? "Alle produkte" : "All products"}
              />
            </SectionTop>

            {products.length === 0 ? (
              <Message>{t("noProductsAvailable")}</Message>
            ) : filtered.length === 0 ? (
              <EmptyCard>
                <Message style={{ marginBottom: 10 }}>
                  {t("noProductsMatchFilters")}
                </Message>
                <ResetButton
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setStore("all");
                  }}
                >
                  {language === "af" ? "Herstel filters" : "Reset filters"}
                </ResetButton>
              </EmptyCard>
            ) : (
              <Grid>
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </Grid>
            )}
          </Section>
        </Stack>
      )}
    </Surface>
  );
}
