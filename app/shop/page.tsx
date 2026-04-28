"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ProductCard } from "@/components/ProductCard";
import { useLanguage } from "@/lib/useLanguage";
import type { Product } from "@/types/product";

const PageTitle = styled.h1`
  margin: 0 0 20px;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    margin-bottom: 28px;
    font-size: 1.75rem;
  }
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

const Filters = styled.div`
  margin: 0 0 18px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 768px) {
    grid-template-columns: 1.2fr 1fr;
    gap: 12px;
  }
`;

const AreaHint = styled.p`
  margin: -10px 0 18px;
  font-size: 0.9375rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Input = styled.input`
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(46, 94, 62, 0.15);
  }
`;

const Select = styled.select`
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(46, 94, 62, 0.15);
  }
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

type StoreOption = { id: string; name: string; slug: string };

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

export default function ShopPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [store, setStore] = useState<string>("all");
  const [areaLabel, setAreaLabel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/location");
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
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [prodRes, storeRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/stores"),
        ]);

        const prodBody: unknown = await prodRes.json().catch(() => null);
        const storeBody: unknown = await storeRes.json().catch(() => null);

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

        if (!cancelled) {
          setProducts(prodBody as Product[]);
          setStores(parsedStores);
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
  }, [t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (store !== "all") {
        if (p.vendorId !== store) return false;
      }
      if (!q) return true;
      const hay = `${p.title} ${p.vendorName ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, query, store]);

  const hasStoresOrProducts = stores.length > 0 || products.length > 0;

  return (
    <>
      <PageTitle>{t("shop")}</PageTitle>
      {areaLabel ? (
        <AreaHint>{t("areaLabel", { area: areaLabel })}</AreaHint>
      ) : null}
      {loading ? (
        <Message>{t("loading")}</Message>
      ) : error ? (
        <Message role="alert">{error}</Message>
      ) : !hasStoresOrProducts ? (
        <Message>{t("noActiveStoresOrProducts")}</Message>
      ) : (
        <>
          <Filters>
            <Field>
              <Label htmlFor="shop-search">{t("searchLabel")}</Label>
              <Input
                id="shop-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
              />
            </Field>
            <Field>
              <Label htmlFor="shop-store">{t("storeFilterLabel")}</Label>
              <Select
                id="shop-store"
                value={store}
                onChange={(e) => setStore(e.target.value)}
              >
                <option value="all">{t("allStores")}</option>
                {stores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
              {store !== "all" ? (
                <Message style={{ marginTop: 6 }}>
                  {t("viewStorePage")}{" "}
                  {(() => {
                    const v = stores.find((x) => x.id === store);
                    return v ? (
                      <ShopLink
                        href={`/shop/${v.slug}--${encodeURIComponent(v.id)}`}
                      >
                        /shop/{v.slug}--{v.id}
                      </ShopLink>
                    ) : null;
                  })()}
                </Message>
              ) : null}
            </Field>
          </Filters>

          {products.length === 0 ? (
            <Message>{t("noProductsAvailable")}</Message>
          ) : filtered.length === 0 ? (
            <Message>{t("noProductsMatchFilters")}</Message>
          ) : (
            <Grid>
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Grid>
          )}
        </>
      )}
    </>
  );
}
