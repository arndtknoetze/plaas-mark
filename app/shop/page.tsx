"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { ProductCard } from "@/components/ProductCard";
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

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <PageTitle>Vars produkte</PageTitle>
      {loading ? (
        <Message>Laai produkte…</Message>
      ) : error ? (
        <Message role="alert">{error}</Message>
      ) : products.length === 0 ? (
        <Message>Geen produkte beskikbaar nie.</Message>
      ) : (
        <Grid>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Grid>
      )}
    </>
  );
}
