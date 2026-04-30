"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styled, { keyframes } from "styled-components";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { useToast } from "@/components/ToastProvider";
import { useCart } from "@/lib/cart-context";
import { loadStoredSession } from "@/lib/session-storage";
import { useLanguage } from "@/lib/useLanguage";
import { slugify } from "@/lib/slug";
import { useResolvedLocationSlug } from "@/lib/useResolvedLocationSlug";
import type { Product } from "@/types/product";

const addedPulse = keyframes`
  0% { transform: translateY(0) scale(1); }
  40% { transform: translateY(-1px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 10px 26px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition:
    box-shadow 0.18s ease,
    transform 0.18s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 1px 0 rgba(0, 0, 0, 0.04),
        0 18px 38px rgba(0, 0, 0, 0.1);
    }
  }
`;

const ClickArea = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;

  &:active {
    transform: scale(0.99);
    opacity: 0.92;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
    border-radius: 12px;
  }
`;

const Thumb = styled.div<{ $hasImage: boolean }>`
  position: relative;
  aspect-ratio: 1 / 1;
  background: ${({ $hasImage, theme }) =>
    $hasImage
      ? "#e8ebe4"
      : `linear-gradient(
    145deg,
    ${theme.colors.background} 0%,
    #e4e8df 100%
  )`};
`;

const ThumbImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const BadgeRow = styled.div`
  position: absolute;
  left: 10px;
  top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  pointer-events: none;
`;

const Badge = styled.span<{ $variant: "featured" | "popular" }>`
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 950;
  letter-spacing: 0.02em;
  color: ${({ $variant, theme }) =>
    $variant === "featured" ? "#ffffff" : theme.colors.textDark};
  background: ${({ $variant, theme }) =>
    $variant === "featured"
      ? theme.colors.primary
      : "rgba(255, 255, 255, 0.86)"};
  border: 1px solid
    ${({ $variant }) =>
      $variant === "featured" ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.08)"};
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 8px 18px rgba(0, 0, 0, 0.08);
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 12px 14px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textDark};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (min-width: 768px) {
    font-size: 1.02rem;
  }
`;

const VendorLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.textLight};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
    border-radius: 6px;
  }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`;

const Price = styled.span`
  font-size: 1.05rem;
  font-weight: 950;
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: -0.02em;

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Unit = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Footer = styled.div`
  margin-top: 4px;
`;

const AddError = styled.p`
  margin: 0 0 8px;
  font-size: 0.8125rem;
  line-height: 1.4;
  font-weight: 600;
  color: #b42318;
`;

const AddButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 900;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.1s ease,
    box-shadow 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:active {
    transform: scale(0.98);
  }

  &[data-added="true"] {
    animation: ${addedPulse} 220ms ease-out;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

function formatPrice(value: number) {
  return `R ${value.toFixed(2).replace(".", ",")}`;
}

const ownedStoreIdsCacheByLocation = new Map<string, Set<string>>();
const ownedStoreIdsPromiseByLocation = new Map<string, Promise<Set<string>>>();

async function loadOwnedStoreIds(locationSlug?: string): Promise<Set<string>> {
  const key = (locationSlug ?? "").trim();
  const cached = ownedStoreIdsCacheByLocation.get(key);
  if (cached) return cached;
  if (typeof window === "undefined") return new Set();
  const session = loadStoredSession();
  if (!session) {
    const empty = new Set<string>();
    ownedStoreIdsCacheByLocation.set(key, empty);
    return empty;
  }
  const inflight = ownedStoreIdsPromiseByLocation.get(key);
  if (inflight) return inflight;

  const url = new URL("/api/stores/my", window.location.origin);
  if (key) url.searchParams.set("location", key);

  const promise = fetch(url.toString())
    .then((r) => r.json())
    .then((data: unknown) => {
      const stores =
        data && typeof data === "object" && "stores" in data
          ? (data as { stores: unknown }).stores
          : [];
      const ids = Array.isArray(stores)
        ? stores
            .map((s) =>
              s && typeof s === "object" && "id" in s
                ? (s as { id?: unknown }).id
                : null,
            )
            .filter((x): x is string => typeof x === "string")
        : [];
      const set = new Set(ids);
      ownedStoreIdsCacheByLocation.set(key, set);
      return set;
    })
    .catch(() => {
      const set = new Set<string>();
      ownedStoreIdsCacheByLocation.set(key, set);
      return set;
    })
    .finally(() => {
      ownedStoreIdsPromiseByLocation.delete(key);
    });
  ownedStoreIdsPromiseByLocation.set(key, promise);
  return promise;
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const toast = useToast();
  const params = useParams<{ location?: string }>();
  const resolvedLocation = useResolvedLocationSlug();
  const locationSlug = params?.location
    ? String(params.location)
    : (resolvedLocation ?? "");
  const [addError, setAddError] = useState<string | null>(null);
  const [ownedStoreIds, setOwnedStoreIds] = useState<Set<string> | null>(null);
  const imageSrc = product.images?.[0] ?? product.image;
  const hasImage = Boolean(imageSrc);
  const badge = useMemo(() => {
    if (product.isFeatured)
      return { label: "Featured", variant: "featured" as const };
    if (product.tags?.some((x) => x.toLowerCase() === "popular"))
      return { label: "Popular", variant: "popular" as const };
    return null;
  }, [product.isFeatured, product.tags]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Best-effort UX: hide/disable add-to-cart for your own products.
  // Server-side enforcement is in POST /api/orders.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ownedStoreIds !== null) return;
    let cancelled = false;
    loadOwnedStoreIds(locationSlug).then((ids) => {
      if (!cancelled) setOwnedStoreIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, [locationSlug, ownedStoreIds]);

  const isOwnProduct = ownedStoreIds?.has(product.vendorId) ?? false;
  const locationPrefix = locationSlug ? `/${locationSlug}` : "";
  const vendorHref =
    product.vendorName && product.vendorId && locationPrefix
      ? `${locationPrefix}/store/${slugify(product.vendorName || "") || "store"}--${encodeURIComponent(product.vendorId)}`
      : null;

  return (
    <>
      <Card>
        <ClickArea
          type="button"
          aria-label={`${product.title}${product.vendorName ? `, ${product.vendorName}` : ""}`}
          onClick={() => setDetailOpen(true)}
        >
          <Thumb $hasImage={hasImage} aria-hidden={!hasImage}>
            {hasImage ? (
              <ThumbImg src={imageSrc} alt={product.title} loading="lazy" />
            ) : null}
            {badge ? (
              <BadgeRow aria-hidden>
                <Badge $variant={badge.variant}>{badge.label}</Badge>
              </BadgeRow>
            ) : null}
          </Thumb>
          <Body>
            <Title>{product.title}</Title>
            {vendorHref ? (
              <VendorLink
                href={vendorHref}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {product.vendorName}
              </VendorLink>
            ) : null}
            <Meta>
              <Price>{formatPrice(product.price)}</Price>
              {product.unit ? <Unit>/{product.unit}</Unit> : null}
            </Meta>
          </Body>
        </ClickArea>

        <Body style={{ paddingTop: 0 }}>
          <Footer>
            {addError ? <AddError role="alert">{addError}</AddError> : null}
            <AddButton
              type="button"
              disabled={isOwnProduct}
              data-added={justAdded ? "true" : "false"}
              onClick={(e) => {
                e.stopPropagation();
                if (isOwnProduct) {
                  const msg = t("cannotBuyOwnProducts");
                  setAddError(msg);
                  toast.error(msg);
                  return;
                }
                const r = addToCart({
                  productId: product.id,
                  name: product.title,
                  price: product.price,
                  quantity: 1,
                  storeId: product.vendorId,
                  storeName: product.vendorName,
                  locationId: product.locationId,
                });
                if (!r.ok) {
                  setAddError(r.error);
                  toast.error(r.error);
                } else {
                  setAddError(null);
                  toast.success("Added to cart.");
                  setJustAdded(true);
                  window.setTimeout(() => setJustAdded(false), 260);
                }
              }}
            >
              {t("addToCart")}
            </AddButton>
          </Footer>
        </Body>
      </Card>

      <ProductDetailModal
        open={detailOpen}
        product={product}
        onClose={() => setDetailOpen(false)}
        onAddToCart={() => {
          if (isOwnProduct) {
            const msg = t("cannotBuyOwnProducts");
            setAddError(msg);
            toast.error(msg);
            return;
          }
          const r = addToCart({
            productId: product.id,
            name: product.title,
            price: product.price,
            quantity: 1,
            storeId: product.vendorId,
            storeName: product.vendorName,
            locationId: product.locationId,
          });
          if (!r.ok) {
            setAddError(r.error);
            toast.error(r.error);
          } else {
            setAddError(null);
            toast.success("Added to cart.");
            setJustAdded(true);
            window.setTimeout(() => setJustAdded(false), 260);
            setDetailOpen(false);
          }
        }}
        addLabel={t("addToCart")}
        closeLabel="Close"
        isAddDisabled={isOwnProduct}
      />
    </>
  );
}
