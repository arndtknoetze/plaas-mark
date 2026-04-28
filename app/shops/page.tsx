"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useLanguage } from "@/lib/useLanguage";

const PageTitle = styled.h1`
  margin: 0 0 14px;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    margin-bottom: 18px;
    font-size: 1.75rem;
  }
`;

const AreaHint = styled.p`
  margin: 0 0 18px;
  font-size: 0.9375rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textLight};
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
    grid-template-columns: 1.2fr;
  }
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }
`;

const StoreCard = styled(Link)`
  display: block;
  padding: 14px 14px 12px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 10px 22px rgba(0, 0, 0, 0.05);
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.04),
      0 14px 28px rgba(0, 0, 0, 0.08);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
  }
`;

const StoreName = styled.div`
  font-size: 1.02rem;
  font-weight: 950;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textDark};
`;

const StoreMeta = styled.div`
  margin-top: 6px;
  font-size: 0.875rem;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.textLight};
  word-break: break-word;
`;

type StoreRow = { id: string; name: string; slug: string };

function parseStoresPayload(body: unknown): StoreRow[] {
  if (!body || typeof body !== "object") return [];
  const raw = (body as { stores?: unknown }).stores;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is StoreRow =>
      Boolean(x) &&
      typeof x === "object" &&
      typeof (x as StoreRow).id === "string" &&
      typeof (x as StoreRow).name === "string" &&
      typeof (x as StoreRow).slug === "string",
  );
}

export default function ShopsPage() {
  const { t } = useLanguage();
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/stores");
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            body &&
            typeof body === "object" &&
            "error" in body &&
            typeof (body as { error: unknown }).error === "string"
              ? (body as { error: string }).error
              : t("errUnknown");
          throw new Error(msg);
        }
        const parsed = parseStoresPayload(body);
        if (!cancelled) {
          setStores(parsed);
          setError(null);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : t("errUnknown"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter((s) => {
      const hay = `${s.name} ${s.slug}`.toLowerCase();
      return hay.includes(q);
    });
  }, [stores, query]);

  return (
    <>
      <PageTitle>Shops</PageTitle>
      {areaLabel ? (
        <AreaHint>{t("areaLabel", { area: areaLabel })}</AreaHint>
      ) : null}

      {loading ? (
        <Message>{t("loading")}</Message>
      ) : error ? (
        <Message role="alert">{error}</Message>
      ) : stores.length === 0 ? (
        <Message>{t("noActiveStoresOrProducts")}</Message>
      ) : (
        <>
          <Filters>
            <Field>
              <Label htmlFor="shops-search">Search stores</Label>
              <Input
                id="shops-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Bakery, cheese, ..."
              />
            </Field>
          </Filters>

          {filtered.length === 0 ? (
            <Message>No stores match your search.</Message>
          ) : (
            <Grid>
              {filtered.map((s) => (
                <StoreCard
                  key={s.id}
                  href={`/shop/${s.slug}--${encodeURIComponent(s.id)}`}
                  aria-label={s.name}
                >
                  <StoreName>{s.name}</StoreName>
                  <StoreMeta>
                    /shop/{s.slug}--{s.id}
                  </StoreMeta>
                </StoreCard>
              ))}
            </Grid>
          )}
        </>
      )}
    </>
  );
}
