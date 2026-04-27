"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/product";

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 14px;
  font-size: 0.875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

const Title = styled.h1`
  margin: 0 0 6px;
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.p`
  margin: 0 0 18px;
  font-size: 0.95rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};
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

export default function ShopByVendorPage() {
  const params = useParams<{ shop: string }>();
  const shopParam = String(params.shop ?? "");
  const storeId = shopParam.includes("--")
    ? (shopParam.split("--").pop() ?? "")
    : "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [storeMeta, setStoreMeta] = useState<{
    addressText: string | null;
    whatsapp: string | null;
    hoursText: string | null;
    logoUrl: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!storeId) {
          throw new Error("Ongeldige winkel skakel.");
        }

        const [storeRes, productRes] = await Promise.all([
          fetch(`/api/stores/${encodeURIComponent(storeId)}`),
          fetch("/api/products"),
        ]);

        const storeBody: unknown = await storeRes.json().catch(() => null);
        if (
          storeRes.ok &&
          storeBody &&
          typeof storeBody === "object" &&
          "store" in storeBody
        ) {
          const s = (storeBody as { store?: unknown }).store;
          if (s && typeof s === "object") {
            const o = s as Record<string, unknown>;
            if (typeof o.name === "string") setStoreName(o.name);
            setStoreMeta({
              addressText:
                typeof o.addressText === "string" ? o.addressText : null,
              whatsapp: typeof o.whatsapp === "string" ? o.whatsapp : null,
              hoursText: typeof o.hoursText === "string" ? o.hoursText : null,
              logoUrl: typeof o.logoUrl === "string" ? o.logoUrl : null,
            });
          }
        }

        const res = productRes;
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) throw new Error("Kon nie produkte laai nie.");
        if (!Array.isArray(body)) throw new Error("Ongeldige antwoord.");
        if (!cancelled) setProducts(body as Product[]);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Onbekende fout.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const filtered = useMemo(() => {
    if (!storeId) return [];
    return products.filter((p) => p.vendorId === storeId);
  }, [products, storeId]);

  return (
    <>
      <BackLink href="/shop">← Terug na winkel</BackLink>
      <Title>{storeName ?? "Winkel"}</Title>
      <Subtitle>Net produkte van hierdie winkel.</Subtitle>

      {storeMeta ? (
        <Message style={{ marginBottom: 14 }}>
          {storeMeta.addressText ? <span>{storeMeta.addressText}</span> : null}
          {storeMeta.whatsapp ? (
            <span>
              {storeMeta.addressText ? " • " : null}WhatsApp:{" "}
              {storeMeta.whatsapp}
            </span>
          ) : null}
          {storeMeta.hoursText ? (
            <span>
              {storeMeta.addressText || storeMeta.whatsapp ? " • " : null}
              Ure: {storeMeta.hoursText}
            </span>
          ) : null}
        </Message>
      ) : null}

      {loading ? (
        <Message>Laai produkte…</Message>
      ) : error ? (
        <Message role="alert">{error}</Message>
      ) : filtered.length === 0 ? (
        <Message>Geen produkte vir hierdie winkel nie.</Message>
      ) : (
        <Grid>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Grid>
      )}
    </>
  );
}
