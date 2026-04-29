"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { loadStoredSession } from "@/lib/session-storage";
import { useResolvedLocationSlug } from "@/lib/useResolvedLocationSlug";

type SellerRow = {
  storeId: string;
  storeName: string;
  shopSlug: string;
  unitsSold: number;
};

const Hero = styled.section`
  padding: 18px 16px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 10px rgba(0, 0, 0, 0.06);
  margin-bottom: 18px;

  @media (min-width: 768px) {
    padding: 22px 20px;
  }
`;

const HeroTitle = styled.h1`
  margin: 0 0 8px;
  font-size: 1.55rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    font-size: 1.9rem;
  }
`;

const HeroText = styled.p`
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};
`;

const HeroActions = styled.div`
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Primary = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Secondary = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  background: #ffffff;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const SectionTitle = styled.h2`
  margin: 22px 0 10px;
  font-size: 1rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textDark};
`;

const SellerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 560px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 920px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

const SellerCard = styled(Link)`
  display: block;
  padding: 14px 14px 12px;
  border-radius: 14px;
  background: #ffffff;
  text-decoration: none;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 10px rgba(0, 0, 0, 0.06);
  color: ${({ theme }) => theme.colors.textDark};
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    box-shadow:
      0 2px 0 rgba(0, 0, 0, 0.04),
      0 10px 26px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const SellerName = styled.div`
  font-weight: 900;
  letter-spacing: -0.02em;
`;

const SellerMeta = styled.div`
  margin-top: 4px;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Message = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};
`;

function isSellerRow(x: unknown): x is SellerRow {
  return (
    Boolean(x) &&
    typeof x === "object" &&
    typeof (x as SellerRow).storeId === "string" &&
    typeof (x as SellerRow).storeName === "string" &&
    typeof (x as SellerRow).shopSlug === "string" &&
    typeof (x as SellerRow).unitsSold === "number"
  );
}

export function HomeClient() {
  const location = useResolvedLocationSlug();
  const shopHref = location ? `/${location}/shop` : "/";
  const storePrefix = location ? `/${location}/store` : "";
  const [session] = useState(() => loadStoredSession());
  const name = session?.name ?? null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellers, setSellers] = useState<SellerRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/top-sellers");
        const data: unknown = await res.json().catch(() => null);
        if (!res.ok) throw new Error("Kon nie top verkopers laai nie.");
        const list =
          data && typeof data === "object" && "sellers" in data
            ? (data as { sellers: unknown }).sellers
            : null;
        if (!Array.isArray(list)) throw new Error("Ongeldige antwoord.");
        const parsed = list.filter(isSellerRow);
        if (!cancelled) setSellers(parsed);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Onbekende fout.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Hero>
        <HeroTitle suppressHydrationWarning>
          {name ? `Welkom terug, ${name}` : "Welkom by PlaasMark"}
        </HeroTitle>
        <HeroText>
          Blaai deur plaasvars produkte van plaaslike verkopers en plaas jou
          bestelling in minute.
        </HeroText>
        <HeroActions>
          <Primary href={shopHref}>Begin inkopies</Primary>
          {session ? (
            <Secondary href="/my-orders">My bestellings</Secondary>
          ) : null}
        </HeroActions>
      </Hero>

      <SectionTitle>Top verkopers</SectionTitle>
      {loading ? (
        <Message>Laai top verkopers…</Message>
      ) : error ? (
        <Message role="alert">{error}</Message>
      ) : sellers.length === 0 ? (
        <Message>Geen top verkopers nog nie.</Message>
      ) : (
        <SellerGrid>
          {sellers.map((s) => (
            <SellerCard
              key={s.storeId}
              href={
                storePrefix
                  ? `${storePrefix}/${s.shopSlug}--${encodeURIComponent(s.storeId)}`
                  : "/"
              }
            >
              <SellerName>{s.storeName}</SellerName>
              <SellerMeta>{s.unitsSold} items verkoop</SellerMeta>
            </SellerCard>
          ))}
        </SellerGrid>
      )}
    </>
  );
}
