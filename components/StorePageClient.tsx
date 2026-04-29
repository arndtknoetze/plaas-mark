"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ProductCard } from "@/components/ProductCard";
import { useLanguage } from "@/lib/useLanguage";
import { loadStoredSession } from "@/lib/session-storage";
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

const StoreCard = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  padding: 14px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 10px 24px rgba(0, 0, 0, 0.06);
  margin-bottom: 18px;

  @media (min-width: 720px) {
    grid-template-columns: 140px 1fr;
    align-items: start;
    padding: 16px;
  }
`;

const StoreLogo = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  object-fit: cover;
`;

const StoreTop = styled.div`
  min-width: 0;
`;

const StoreNameRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const StoreTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 950;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    font-size: 1.9rem;
  }
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.textDark};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const StoreDesc = styled.p`
  margin: 8px 0 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};
`;

const InfoGrid = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const InfoBox = styled.div`
  border-radius: 14px;
  padding: 12px 12px 11px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: ${({ theme }) => theme.colors.background};
`;

const InfoLabel = styled.div`
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textLight};
`;

const InfoValue = styled.div`
  margin-top: 4px;
  font-size: 0.95rem;
  line-height: 1.5;
  font-weight: 750;
  color: ${({ theme }) => theme.colors.textDark};
  word-break: break-word;
  white-space: pre-wrap;
`;

const ActionRow = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const IconButtonLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.primary};
  background: #ffffff;
  border: 2px solid ${({ theme }) => theme.colors.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const IconLabel = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

function normalizeUrl(raw: string | null): string | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v.replace(/^https?:\/\//i, "")}`;
}

function instagramUrl(raw: string | null): string | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, "").replace(/^instagram\.com\//i, "");
  if (!handle) return null;
  return `https://instagram.com/${encodeURIComponent(handle)}`;
}

function facebookUrl(raw: string | null): string | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const page = v.replace(/^@/, "").replace(/^facebook\.com\//i, "");
  if (!page) return null;
  return `https://facebook.com/${encodeURIComponent(page)}`;
}

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

export default function StorePageClient() {
  const { t } = useLanguage();
  const params = useParams<{ slug?: string; location?: string }>();
  const locationSlug = params.location ? String(params.location) : "";
  const locationQuery = locationSlug
    ? `?location=${encodeURIComponent(locationSlug)}`
    : "";
  const locationPrefix = locationSlug ? `/${locationSlug}` : "";

  const slugParam = String(params.slug ?? "");
  const storeId = slugParam.includes("--")
    ? (slugParam.split("--").pop() ?? "")
    : "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [ownedStoreIds, setOwnedStoreIds] = useState<Set<string> | null>(null);
  const [storeMeta, setStoreMeta] = useState<{
    addressText: string | null;
    email: string | null;
    whatsapp: string | null;
    instagram: string | null;
    facebook: string | null;
    website: string | null;
    hoursText: string | null;
    logoUrl: string | null;
    slug: string | null;
  } | null>(null);

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
        if (!storeId) {
          throw new Error(t("invalidStoreLink"));
        }

        const [storeRes, productRes] = await Promise.all([
          fetch(`/api/stores/${encodeURIComponent(storeId)}${locationQuery}`),
          fetch(`/api/products${locationQuery}`),
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
              email: typeof o.email === "string" ? o.email : null,
              whatsapp: typeof o.whatsapp === "string" ? o.whatsapp : null,
              instagram: typeof o.instagram === "string" ? o.instagram : null,
              facebook: typeof o.facebook === "string" ? o.facebook : null,
              website: typeof o.website === "string" ? o.website : null,
              hoursText: typeof o.hoursText === "string" ? o.hoursText : null,
              logoUrl: typeof o.logoUrl === "string" ? o.logoUrl : null,
              slug: typeof o.slug === "string" ? o.slug : null,
            });
          }
        }

        const body: unknown = await productRes.json().catch(() => null);
        if (!productRes.ok) throw new Error(t("errUnknown"));
        if (!Array.isArray(body))
          throw new Error(t("errInvalidServerResponse"));
        if (!cancelled) setProducts(body as Product[]);
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
  }, [locationQuery, storeId, t]);

  const filtered = useMemo(() => {
    if (!storeId) return [];
    if (ownedStoreIds?.has(storeId)) return [];
    return products.filter((p) => p.vendorId === storeId);
  }, [ownedStoreIds, products, storeId]);

  const displayName = storeName ?? t("shop");
  const publicUrl =
    storeMeta?.slug && storeId
      ? `${locationPrefix}/store/${storeMeta.slug}--${encodeURIComponent(storeId)}`
      : null;

  const websiteHref = normalizeUrl(storeMeta?.website ?? null);
  const instagramHref = instagramUrl(storeMeta?.instagram ?? null);
  const facebookHref = facebookUrl(storeMeta?.facebook ?? null);

  const whatsappDigits = storeMeta?.whatsapp
    ? storeMeta.whatsapp.replace(/[^\d+]/g, "")
    : "";
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits.replace(/^\+/, "")}`
    : null;

  return (
    <>
      <BackLink href={`${locationPrefix}/shop`}>{t("backToShop")}</BackLink>

      {storeMeta ? (
        <StoreCard aria-label={displayName}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <StoreLogo
              src={storeMeta.logoUrl || "/logo.png"}
              alt={storeMeta.logoUrl ? `${displayName} logo` : "PlaasMark"}
              loading="eager"
            />
          </div>
          <StoreTop>
            <StoreNameRow>
              <StoreTitle>{displayName}</StoreTitle>
              <BadgeRow>
                {publicUrl ? <Badge>{publicUrl}</Badge> : null}
              </BadgeRow>
            </StoreNameRow>
            <StoreDesc>{t("storePublicInfo")}</StoreDesc>

            <InfoGrid>
              {storeMeta.addressText ? (
                <InfoBox>
                  <InfoLabel>{t("address")}</InfoLabel>
                  <InfoValue>{storeMeta.addressText}</InfoValue>
                </InfoBox>
              ) : null}
              {storeMeta.hoursText ? (
                <InfoBox>
                  <InfoLabel>{t("hours")}</InfoLabel>
                  <InfoValue>{storeMeta.hoursText}</InfoValue>
                </InfoBox>
              ) : null}
              {storeMeta.whatsapp ? (
                <InfoBox>
                  <InfoLabel>WhatsApp</InfoLabel>
                  <InfoValue>{storeMeta.whatsapp}</InfoValue>
                </InfoBox>
              ) : null}
              {storeMeta.email ? (
                <InfoBox>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{storeMeta.email}</InfoValue>
                </InfoBox>
              ) : null}
            </InfoGrid>

            <ActionRow>
              {whatsappHref ? (
                <IconButtonLink
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  title="WhatsApp"
                >
                  <IconLabel>WhatsApp</IconLabel>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M20.5 11.9a8.6 8.6 0 0 1-12.6 7.7L3.5 21l1.5-4.2A8.6 8.6 0 1 1 20.5 11.9Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.3 8.8c-.3.6-.7 1.1-.6 1.7.1.7.8 1.7 1.8 2.7 1 1 2 1.7 2.7 1.8.6.1 1.1-.3 1.7-.6.4-.2.8-.1 1.1.2l1 .9c.3.3.3.8 0 1.1-.5.7-1.3 1.2-2.2 1.1-1.2-.1-3.1-.9-5.2-3-2.1-2.1-2.9-4-3-5.2-.1-.9.4-1.7 1.1-2.2.3-.3.8-.3 1.1 0l.9 1c.3.3.4.7.2 1.1Z"
                      fill="currentColor"
                      opacity="0.9"
                    />
                  </svg>
                </IconButtonLink>
              ) : null}
              {storeMeta.email ? (
                <IconButtonLink
                  href={`mailto:${storeMeta.email}`}
                  aria-label="Email"
                  title="Email"
                >
                  <IconLabel>Email</IconLabel>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M4.5 7.5h15v9h-15v-9Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m5.2 8.1 6.8 5.4 6.8-5.4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButtonLink>
              ) : null}
              {instagramHref ? (
                <IconButtonLink
                  href={instagramHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <IconLabel>Instagram</IconLabel>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M7.5 3.9h9A3.6 3.6 0 0 1 20.1 7.5v9a3.6 3.6 0 0 1-3.6 3.6h-9a3.6 3.6 0 0 1-3.6-3.6v-9a3.6 3.6 0 0 1 3.6-3.6Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 16.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M17.2 7.2h.01"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </IconButtonLink>
              ) : null}
              {facebookHref ? (
                <IconButtonLink
                  href={facebookHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <IconLabel>Facebook</IconLabel>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M14 8.5V7.3c0-.8.6-1.3 1.4-1.3H17V3.9h-1.6c-2.2 0-3.9 1.6-3.9 3.8v.8H9.5v2.4h2.1V20h2.9v-9.1H17l.5-2.4H14Z"
                      fill="currentColor"
                      opacity="0.9"
                    />
                  </svg>
                </IconButtonLink>
              ) : null}
              {websiteHref ? (
                <IconButtonLink
                  href={websiteHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Website"
                  title="Website"
                >
                  <IconLabel>Website</IconLabel>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M12 20.1a8.1 8.1 0 1 0 0-16.2 8.1 8.1 0 0 0 0 16.2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M3.9 12h16.2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 3.9c2.2 2.2 3.5 5 3.5 8.1S14.2 17.9 12 20.1C9.8 17.9 8.5 15.1 8.5 12S9.8 6.1 12 3.9Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButtonLink>
              ) : null}
            </ActionRow>
          </StoreTop>
        </StoreCard>
      ) : (
        <>
          <Title>{displayName}</Title>
          <Subtitle>{t("storeProductsOnly")}</Subtitle>
        </>
      )}

      {loading ? (
        <Message>{t("loadingProducts")}</Message>
      ) : error ? (
        <Message role="alert">{error}</Message>
      ) : filtered.length === 0 ? (
        <Message>{t("noProductsForStore")}</Message>
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
