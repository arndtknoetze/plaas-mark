"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ProductCard } from "@/components/ProductCard";
import { slugify } from "@/lib/slug";
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
    grid-template-columns: 1.2fr 0.8fr;
    gap: 12px;
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

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [store, setStore] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/products");
        const body: unknown = await res.json().catch(() => null);

        if (!res.ok) {
          const msg =
            body &&
            typeof body === "object" &&
            "error" in body &&
            typeof (body as { error: unknown }).error === "string"
              ? (body as { error: string }).error
              : "Kon nie produkte laai nie.";
          throw new Error(msg);
        }

        if (!Array.isArray(body)) {
          throw new Error("Ongeldige antwoord.");
        }

        if (!cancelled) {
          setProducts(body as Product[]);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Onbekende fout.");
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
  }, []);

  const vendors = useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string }>();
    for (const p of products) {
      const name = p.vendorName?.trim();
      const id = (p.vendorId ?? "").trim();
      if (!id) continue;
      if (!name) continue;
      const slug = slugify(name);
      if (!slug) continue;
      const key = `${slug}--${id}`;
      if (!map.has(key)) map.set(key, { id, name, slug });
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [products]);

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

  return (
    <>
      <PageTitle>Winkel</PageTitle>
      {loading ? (
        <Message>Laai produkte…</Message>
      ) : error ? (
        <Message role="alert">{error}</Message>
      ) : products.length === 0 ? (
        <Message>Geen produkte beskikbaar nie.</Message>
      ) : (
        <>
          <Filters>
            <Field>
              <Label htmlFor="shop-search">Soek</Label>
              <Input
                id="shop-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Soek produkte of verkoper…"
              />
            </Field>
            <Field>
              <Label htmlFor="shop-store">Winkel</Label>
              <Select
                id="shop-store"
                value={store}
                onChange={(e) => setStore(e.target.value)}
              >
                <option value="all">Alle winkels</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
              {store !== "all" ? (
                <Message style={{ marginTop: 6 }}>
                  Bekyk winkelblad:{" "}
                  {(() => {
                    const v = vendors.find((x) => x.id === store);
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

          {filtered.length === 0 ? (
            <Message>Geen produkte pas by jou filters nie.</Message>
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
