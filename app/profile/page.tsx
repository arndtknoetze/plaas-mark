"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { AccountOtpForm } from "@/components/AccountOtpForm";
import { fileToCroppedDataUrl } from "@/lib/image-crop";
import { useLanguage } from "@/lib/useLanguage";
import {
  clearStoredSession,
  loadStoredSession,
  type StoredSession,
} from "@/lib/session-storage";

type StoreRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  brandColor: string;
  logoUrl: string | null;
  addressText: string | null;
  email: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  hoursText: string | null;
};

type MyProductRow = {
  id: string;
  title: string;
  price: number;
  unit?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
};

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px 0 28px;
`;

const DashboardTop = styled.div<{ $accent: string }>`
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    ${({ $accent }) => $accent} 0%,
    rgba(255, 255, 255, 1) 70%
  );
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 10px 26px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const TopInner = styled.div`
  padding: 16px;

  @media (min-width: 768px) {
    padding: 18px;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 950;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    font-size: 1.6rem;
  }
`;

const Subtitle = styled.p`
  margin: 6px 0 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};
`;

const TopLinks = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const PillLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: ${({ theme }) => theme.colors.textDark};
  text-decoration: none;
  font-weight: 800;
  font-size: 0.85rem;

  &:hover {
    border-color: rgba(0, 0, 0, 0.14);
    background: #ffffff;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 980px) {
    grid-template-columns: 360px 1fr;
    align-items: start;
  }
`;

const Card = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 10px 22px rgba(0, 0, 0, 0.06);
`;

const SectionTitle = styled.h2`
  margin: 0 0 10px;
  font-size: 0.95rem;
  font-weight: 950;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Muted = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};
`;

const SplitRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 540px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Kpi = styled.div`
  border-radius: 14px;
  padding: 12px 12px 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: ${({ theme }) => theme.colors.background};
`;

const KpiLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 800;
`;

const KpiValue = styled.div`
  margin-top: 2px;
  font-size: 1.05rem;
  font-weight: 950;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Actions = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-weight: 900;
  text-decoration: none;
  border: 2px solid ${({ theme }) => theme.colors.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    border-color: ${({ theme }) => theme.colors.secondary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const SecondaryButton = styled.button`
  min-height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background: #ffffff;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 900;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Divider = styled.div`
  height: 1px;
  margin: 12px 0;
  background: ${({ theme }) => theme.colors.background};
`;

const StoreList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
`;

const MobileOnly = styled.div`
  display: block;

  @media (min-width: 980px) {
    display: none;
  }
`;

const DesktopOnly = styled.div`
  display: none;

  @media (min-width: 980px) {
    display: block;
  }
`;

const StoreBtn = styled.button<{ $active: boolean; $color?: string }>`
  text-align: left;
  width: 100%;
  border: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : "#e2e2de")};
  background: ${({ $active }) =>
    $active ? "rgba(46, 94, 62, 0.06)" : "#ffffff"};
  border-radius: 16px;
  padding: 12px 12px 11px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    transform 0.08s ease;

  &:active {
    transform: scale(0.99);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const StoreTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const StoreDot = styled.span<{ $color?: string }>`
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: ${({ $color, theme }) => $color || theme.colors.primary};
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.03);
`;

const StoreName = styled.div`
  font-weight: 950;
  color: ${({ theme }) => theme.colors.textDark};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusPill = styled.span<{ $active: boolean }>`
  margin-left: auto;
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 950;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid
    ${({ $active }) =>
      $active ? "rgba(46, 94, 62, 0.28)" : "rgba(0,0,0,0.12)"};
  background: ${({ $active }) =>
    $active ? "rgba(46, 94, 62, 0.12)" : "rgba(0,0,0,0.04)"};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textLight};
`;

const StoreMeta = styled.div`
  margin-top: 6px;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textLight};
  word-break: break-word;
`;

const StoreBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const StoreLogo = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  object-fit: contain;
  flex-shrink: 0;
`;

const StoreBadgeText = styled.div`
  min-width: 0;
`;

const StoreBadgeName = styled.div`
  font-weight: 950;
  color: ${({ theme }) => theme.colors.textDark};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StoreBadgeUrl = styled.div`
  margin-top: 2px;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textLight};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Select = styled.select`
  width: 100%;
  min-height: 48px;
  padding: 0 12px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: #ffffff;
  font-size: 1rem;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.textDark};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(46, 94, 62, 0.15);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 800;
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

const TextArea = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 12px 14px;
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(46, 94, 62, 0.15);
  }
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Toggle = styled.input`
  width: 44px;
  height: 24px;
`;

const ColorRow = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 10px;
  align-items: center;
`;

const ColorSwatch = styled.input`
  width: 64px;
  height: 50px;
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  padding: 6px;
  background: #ffffff;
`;

const Hint = styled.p`
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ErrorMsg = styled.p`
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #8a1c1c;
  background: #fdeaea;
  border: 1px solid #f0c4c4;
`;

const SuccessMsg = styled.p`
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.primary};
  background: rgba(46, 94, 62, 0.08);
  border: 1px solid rgba(46, 94, 62, 0.18);
`;

const WarnMsg = styled.p`
  margin: 0 0 14px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.45;
  color: #7a4a08;
  background: #fff8e6;
  border: 1px solid #e8d4a8;
`;

const FileInput = styled.input`
  width: 100%;
  min-height: 50px;
  padding: 10px 14px;
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(46, 94, 62, 0.15);
  }
`;

const PreviewBox = styled.div`
  margin-top: 8px;
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  background: #ffffff;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  overflow: hidden;
`;

const PreviewImg = styled.img`
  width: 100%;
  max-width: 280px;
  aspect-ratio: 4 / 5;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
  display: block;
`;

const LogoPreviewBox = styled.div`
  margin-top: 8px;
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  background: #ffffff;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  overflow: hidden;
`;

const LogoPreviewImg = styled.img`
  width: 160px;
  height: 160px;
  border-radius: 16px;
  object-fit: cover;
  display: block;
`;

const TinyActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const TinyBtn = styled.button`
  min-height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background: #ffffff;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 900;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
`;

const ProductRow = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
`;

const ProductThumb = styled.div`
  width: 64px;
  aspect-ratio: 4 / 5;
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const ProductThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ProductTitle = styled.div`
  font-weight: 950;
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.15;
`;

const ProductMeta = styled.div`
  margin-top: 4px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const PrimaryBtn = styled.button`
  width: 100%;
  min-height: 50px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 900;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const CtaCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

function storePublicUrl(s: Pick<StoreRow, "slug" | "id">) {
  return `/shop/${s.slug}--${s.id}`;
}

function isHexColor(x: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(x.trim());
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.trim().replace("#", "");
  const a = Math.max(0, Math.min(1, alpha));
  const full =
    h.length === 3
      ? `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
      : h.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function formatCurrencyZar(value: number) {
  if (!Number.isFinite(value)) return "R 0,00";
  return `R ${value.toFixed(2).replace(".", ",")}`;
}

export default function ProfilePage() {
  // Hydration-safe: render a stable “logged out” view first, then load localStorage after mount.
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialStoreParam = searchParams.get("store");
  const showFirstProductHint = searchParams.get("firstProduct") === "1";

  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [productTitle, setProductTitle] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState("");
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [productSuccess, setProductSuccess] = useState<string | null>(null);
  const [myProducts, setMyProducts] = useState<MyProductRow[]>([]);
  const [loadingMyProducts, setLoadingMyProducts] = useState(false);
  const [myProductsError, setMyProductsError] = useState<string | null>(null);

  useEffect(() => {
    // This page depends on localStorage; we intentionally update state after mount.
    /* eslint-disable react-hooks/set-state-in-effect */
    setHydrated(true);
    setSession(loadStoredSession());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated || !session) return;
    let cancelled = false;
    (async () => {
      setStoreError(null);
      setLoadingStores(true);
      try {
        const res = await fetch(
          `/api/stores/my?phone=${encodeURIComponent(session.phone)}`,
        );
        const data: unknown = await res.json().catch(() => null);
        if (!res.ok) throw new Error(t("errCouldNotLoadStores"));
        const list =
          data && typeof data === "object" && "stores" in data
            ? (data as { stores: unknown }).stores
            : null;
        if (!Array.isArray(list))
          throw new Error(t("errInvalidServerResponse"));
        const parsed = list.filter(
          (x): x is StoreRow =>
            Boolean(x) &&
            typeof x === "object" &&
            typeof (x as StoreRow).id === "string" &&
            typeof (x as StoreRow).name === "string" &&
            typeof (x as StoreRow).slug === "string" &&
            typeof (x as StoreRow).isActive === "boolean",
        );
        if (!cancelled) {
          setStores(parsed);
          const paramStore = initialStoreParam;
          setSelectedStoreId(
            paramStore && parsed.some((s) => s.id === paramStore)
              ? paramStore
              : (parsed[0]?.id ?? null),
          );
        }
      } catch (e) {
        if (!cancelled)
          setStoreError(e instanceof Error ? e.message : t("errUnknown"));
      } finally {
        if (!cancelled) setLoadingStores(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, session, initialStoreParam, t]);

  const selected = stores.find((s) => s.id === selectedStoreId) ?? null;
  const [draft, setDraft] = useState<StoreRow | null>(() => selected);

  const loadMyProducts = async (phone: string, storeId: string) => {
    setMyProductsError(null);
    setLoadingMyProducts(true);
    try {
      const res = await fetch(
        `/api/products/my?phone=${encodeURIComponent(phone)}&storeId=${encodeURIComponent(storeId)}`,
        { cache: "no-store" },
      );
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : t("errCouldNotLoadProducts");
        throw new Error(msg);
      }
      const list =
        data && typeof data === "object" && "products" in data
          ? (data as { products: unknown }).products
          : null;
      if (!Array.isArray(list)) throw new Error(t("errInvalidServerResponse"));
      const parsed = list.filter(
        (x): x is MyProductRow =>
          Boolean(x) &&
          typeof x === "object" &&
          typeof (x as MyProductRow).id === "string" &&
          typeof (x as MyProductRow).title === "string" &&
          typeof (x as MyProductRow).price === "number",
      );
      setMyProducts(parsed);
    } catch (e) {
      setMyProductsError(e instanceof Error ? e.message : t("errUnknown"));
      setMyProducts([]);
    } finally {
      setLoadingMyProducts(false);
    }
  };

  const activateSelectedStore = async () => {
    if (!session || !draft) return;
    setSaving(true);
    setStoreError(null);
    try {
      const res = await fetch(`/api/stores/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: session.phone,
          name: draft.name,
          isActive: true,
          brandColor: draft.brandColor,
          logoUrl: draft.logoUrl,
          addressText: draft.addressText,
          email: draft.email,
          whatsapp: draft.whatsapp,
          instagram: draft.instagram,
          facebook: draft.facebook,
          website: draft.website,
          hoursText: draft.hoursText,
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : t("errUnknown");
        throw new Error(msg);
      }
      setDraft((d) => (d ? { ...d, isActive: true } : d));
      setStores((prev) =>
        prev.map((s) => (s.id === draft.id ? { ...s, isActive: true } : s)),
      );
    } catch (e) {
      setStoreError(e instanceof Error ? e.message : t("errUnknown"));
    } finally {
      setSaving(false);
    }
  };

  // When switching stores, copy fields into the editor.
  // This page is intentionally localStorage/API-driven; we accept the effect update here.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setDraft(selected);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [selectedStoreId, selected]);

  useEffect(() => {
    if (!hydrated || !session || !selectedStoreId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- effect coordinates async external fetch
    void loadMyProducts(session.phone, selectedStoreId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reload when store changes
  }, [hydrated, session?.phone, selectedStoreId]);

  const selectedAccent = selected?.brandColor?.trim();
  const accent =
    selectedAccent && isHexColor(selectedAccent)
      ? hexToRgba(selectedAccent, 0.16)
      : "rgba(46, 94, 62, 0.12)";

  if (!hydrated || !session) {
    return (
      <Page>
        <DashboardTop $accent={"rgba(46, 94, 62, 0.12)"}>
          <TopInner>
            <Title>{t("account")}</Title>
            <Subtitle>{t("activitySignInPrompt")}</Subtitle>
            <TopLinks>
              <PillLink href="/shop">{t("shop")}</PillLink>
              <PillLink href="/my-orders">{t("myOrders")}</PillLink>
            </TopLinks>
          </TopInner>
        </DashboardTop>

        <Card>
          <SectionTitle>{t("signInTitle")}</SectionTitle>
          <Muted style={{ marginBottom: 12 }}>
            {t("accountStoredOnDevice")}
          </Muted>
          <AccountOtpForm onSuccess={() => setSession(loadStoredSession())} />
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <DashboardTop $accent={accent}>
        <TopInner>
          <Title>{t("dashboardTitle")}</Title>
          <Subtitle>{t("helloManageStores", { name: session.name })}</Subtitle>
          <TopLinks>
            <PillLink href="/shop">{t("shop")}</PillLink>
            <PillLink href="/account/orders">{t("storeOrders")}</PillLink>
            <PillLink href="/activity">{t("activity")}</PillLink>
            <PillLink href="/my-orders">{t("myOrders")}</PillLink>
          </TopLinks>
        </TopInner>
      </DashboardTop>

      {showFirstProductHint ? (
        <WarnMsg role="status">
          <strong>{t("addFirstProductHintTitle")}</strong>{" "}
          {t("addFirstProductHintBody")}
        </WarnMsg>
      ) : null}

      <Layout>
        <div>
          <Card>
            <SectionTitle>{t("yourAccount")}</SectionTitle>
            <SplitRow>
              <Kpi>
                <KpiLabel>{t("nameLabel")}</KpiLabel>
                <KpiValue>{session.name}</KpiValue>
              </Kpi>
              <Kpi>
                <KpiLabel>{t("phoneLabel")}</KpiLabel>
                <KpiValue>{session.phone}</KpiValue>
              </Kpi>
            </SplitRow>
            <Actions>
              <PrimaryLink href="/begin-verkoop">
                {t("createNewStore")}
              </PrimaryLink>
              <SecondaryButton
                type="button"
                onClick={() => {
                  clearStoredSession();
                  setSession(null);
                }}
              >
                {t("signOutButton")}
              </SecondaryButton>
            </Actions>
          </Card>

          <Card style={{ marginTop: 14 }}>
            <SectionTitle>{t("yourStores")}</SectionTitle>
            {loadingStores ? <Muted>{t("loadingStores")}</Muted> : null}
            {storeError ? <Muted role="alert">{storeError}</Muted> : null}

            {!loadingStores && stores.length === 0 ? (
              <>
                <Divider />
                <CtaCard>
                  <Muted>{t("noStoreYet")}</Muted>
                  <PrimaryLink href="/begin-verkoop">
                    {t("startSellingCta")}
                  </PrimaryLink>
                </CtaCard>
              </>
            ) : null}

            {stores.length > 0 ? (
              <>
                <Divider />
                <Muted style={{ marginBottom: 10 }}>
                  {t("chooseStoreToManage")}
                </Muted>

                <MobileOnly style={{ marginBottom: 10 }}>
                  <Select
                    aria-label={t("chooseStoreAria")}
                    value={selectedStoreId ?? ""}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}{" "}
                        {s.isActive ? `(${t("active")})` : `(${t("inactive")})`}
                      </option>
                    ))}
                  </Select>
                </MobileOnly>

                <DesktopOnly>
                  <StoreList>
                    {stores.map((s) => (
                      <StoreBtn
                        key={s.id}
                        type="button"
                        $active={s.id === selectedStoreId}
                        $color={s.brandColor}
                        onClick={() => setSelectedStoreId(s.id)}
                        aria-pressed={s.id === selectedStoreId}
                      >
                        <StoreTitleRow>
                          <StoreDot $color={s.brandColor} />
                          <StoreName>{s.name}</StoreName>
                          <StatusPill $active={s.isActive}>
                            {s.isActive ? t("active") : t("inactive")}
                          </StatusPill>
                        </StoreTitleRow>
                        <StoreMeta>{storePublicUrl(s)}</StoreMeta>
                      </StoreBtn>
                    ))}
                  </StoreList>
                </DesktopOnly>
              </>
            ) : null}
          </Card>
        </div>

        <div>
          <Card>
            <SectionTitle>{t("storeOverview")}</SectionTitle>
            {!draft ? (
              <Muted>{t("chooseStoreToStart")}</Muted>
            ) : (
              <>
                <SplitRow>
                  <Kpi>
                    <KpiLabel>{t("shop")}</KpiLabel>
                    <KpiValue>{draft.name}</KpiValue>
                  </Kpi>
                  <Kpi>
                    <KpiLabel>{t("orderStatusLabel")}</KpiLabel>
                    <KpiValue>
                      {draft.isActive ? t("active") : t("inactive")}
                    </KpiValue>
                  </Kpi>
                </SplitRow>

                <StoreBadgeRow>
                  {draft.logoUrl ? (
                    <StoreLogo src={draft.logoUrl} alt={`${draft.name} logo`} />
                  ) : (
                    <StoreLogo
                      src="/logo.png"
                      alt="PlaasMark"
                      style={{ opacity: 0.85 }}
                    />
                  )}
                  <StoreBadgeText>
                    <StoreBadgeName>{draft.name}</StoreBadgeName>
                    <StoreBadgeUrl>{storePublicUrl(draft)}</StoreBadgeUrl>
                  </StoreBadgeText>
                </StoreBadgeRow>

                <Actions>
                  <PrimaryLink href={storePublicUrl(draft)}>
                    {t("goToStorePage")}
                  </PrimaryLink>
                  <PillLink
                    href={`/profile?store=${encodeURIComponent(draft.id)}`}
                  >
                    {t("shareLink")}
                  </PillLink>
                </Actions>

                {!draft.isActive ? (
                  <WarnMsg role="status" style={{ marginTop: 12 }}>
                    {t("storeNotActiveWarning")}
                    <div style={{ marginTop: 10 }}>
                      <PrimaryBtn
                        type="button"
                        disabled={saving}
                        onClick={() => void activateSelectedStore()}
                      >
                        {saving ? t("activating") : t("activateStore")}
                      </PrimaryBtn>
                    </div>
                  </WarnMsg>
                ) : null}
              </>
            )}
          </Card>

          {draft ? (
            <>
              <Card style={{ marginTop: 14 }}>
                <SectionTitle>{t("storeSetup")}</SectionTitle>
                <Form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!session) return;
                    setSaving(true);
                    setStoreError(null);
                    try {
                      const res = await fetch(`/api/stores/${draft.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          phone: session.phone,
                          name: draft.name,
                          isActive: draft.isActive,
                          brandColor: draft.brandColor,
                          logoUrl: draft.logoUrl,
                          addressText: draft.addressText,
                          email: draft.email,
                          whatsapp: draft.whatsapp,
                          instagram: draft.instagram,
                          facebook: draft.facebook,
                          website: draft.website,
                          hoursText: draft.hoursText,
                        }),
                      });
                      const data: unknown = await res.json().catch(() => null);
                      if (!res.ok) {
                        const msg =
                          data &&
                          typeof data === "object" &&
                          "error" in data &&
                          typeof (data as { error: unknown }).error === "string"
                            ? (data as { error: string }).error
                            : t("errCouldNotPlaceOrder");
                        throw new Error(msg);
                      }
                      setStores((prev) =>
                        prev.map((s) =>
                          s.id === draft.id ? { ...s, ...draft } : s,
                        ),
                      );
                    } catch (e2) {
                      setStoreError(
                        e2 instanceof Error ? e2.message : t("errUnknown"),
                      );
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <Field>
                    <Label htmlFor="store-name">{t("storeNameLabel")}</Label>
                    <Input
                      id="store-name"
                      value={draft.name}
                      onChange={(e) =>
                        setDraft((d) =>
                          d ? { ...d, name: e.target.value } : d,
                        )
                      }
                      required
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="store-brandColor">
                      {t("brandColorLabel")}
                    </Label>
                    <ColorRow>
                      <ColorSwatch
                        id="store-brandColor"
                        type="color"
                        value={draft.brandColor || "#2E5E3E"}
                        onChange={(e) =>
                          setDraft((d) =>
                            d ? { ...d, brandColor: e.target.value } : d,
                          )
                        }
                        aria-label={t("brandColorAria")}
                      />
                      <Input
                        value={draft.brandColor || ""}
                        onChange={(e) =>
                          setDraft((d) =>
                            d ? { ...d, brandColor: e.target.value } : d,
                          )
                        }
                        placeholder="#2E5E3E"
                        inputMode="text"
                      />
                    </ColorRow>
                    <Hint>{t("brandColorHint")}</Hint>
                  </Field>

                  <Field>
                    <Label htmlFor="store-logo-file">
                      {t("storeLogoLabel")}
                    </Label>
                    <FileInput
                      id="store-logo-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setStoreError(null);
                        const file = e.target.files?.[0] ?? null;
                        if (!file) return;
                        if (!file.type.startsWith("image/")) {
                          setStoreError(t("errChooseImage"));
                          return;
                        }
                        if (file.size > 2 * 1024 * 1024) {
                          setStoreError(t("errImageTooLarge"));
                          return;
                        }
                        void (async () => {
                          try {
                            const cropped = await fileToCroppedDataUrl(file, {
                              aspect: "square",
                              maxSize: 512,
                              mimeType: "image/webp",
                              quality: 0.9,
                            });
                            setDraft((d) =>
                              d ? { ...d, logoUrl: cropped } : d,
                            );
                          } catch (err) {
                            setStoreError(
                              err instanceof Error
                                ? err.message
                                : t("errUnknown"),
                            );
                          }
                        })();
                      }}
                    />
                    <TinyActions>
                      <TinyBtn
                        type="button"
                        onClick={() =>
                          setDraft((d) => (d ? { ...d, logoUrl: null } : d))
                        }
                        disabled={!draft.logoUrl}
                      >
                        {t("removeLogo")}
                      </TinyBtn>
                    </TinyActions>
                    {draft.logoUrl ? (
                      <LogoPreviewBox aria-label={t("logoPreviewAria")}>
                        <LogoPreviewImg
                          src={draft.logoUrl}
                          alt={t("logoPreviewAlt")}
                        />
                      </LogoPreviewBox>
                    ) : null}
                    <Hint>{t("logoUploadHintSquare")}</Hint>
                  </Field>

                  <Field>
                    <Label htmlFor="store-active">
                      {t("storeActiveLabel")}
                    </Label>
                    <ToggleRow>
                      <Toggle
                        id="store-active"
                        type="checkbox"
                        checked={draft.isActive}
                        onChange={(e) =>
                          setDraft((d) =>
                            d ? { ...d, isActive: e.target.checked } : d,
                          )
                        }
                      />
                      <Hint>
                        {t("storeActiveHint", { url: storePublicUrl(draft) })}
                      </Hint>
                    </ToggleRow>
                  </Field>

                  <Field>
                    <Label htmlFor="store-address">
                      {t("storeAddressLabel")}
                    </Label>
                    <TextArea
                      id="store-address"
                      value={draft.addressText ?? ""}
                      onChange={(e) =>
                        setDraft((d) =>
                          d ? { ...d, addressText: e.target.value } : d,
                        )
                      }
                      placeholder={t("storeAddressPlaceholder")}
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="store-whatsapp">
                      {t("storeWhatsappLabel")}
                    </Label>
                    <Input
                      id="store-whatsapp"
                      value={draft.whatsapp ?? ""}
                      onChange={(e) =>
                        setDraft((d) =>
                          d ? { ...d, whatsapp: e.target.value } : d,
                        )
                      }
                      placeholder={t("storeWhatsappPlaceholder")}
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="store-instagram">Instagram</Label>
                    <Input
                      id="store-instagram"
                      value={draft.instagram ?? ""}
                      onChange={(e) =>
                        setDraft((d) =>
                          d ? { ...d, instagram: e.target.value } : d,
                        )
                      }
                      placeholder={t("storeInstagramPlaceholder")}
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="store-facebook">Facebook</Label>
                    <Input
                      id="store-facebook"
                      value={draft.facebook ?? ""}
                      onChange={(e) =>
                        setDraft((d) =>
                          d ? { ...d, facebook: e.target.value } : d,
                        )
                      }
                      placeholder={t("storeFacebookPlaceholder")}
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="store-website">
                      {t("storeWebsiteLabel")}
                    </Label>
                    <Input
                      id="store-website"
                      value={draft.website ?? ""}
                      onChange={(e) =>
                        setDraft((d) =>
                          d ? { ...d, website: e.target.value } : d,
                        )
                      }
                      placeholder={t("storeWebsitePlaceholder")}
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="store-hours">{t("storeHoursLabel")}</Label>
                    <TextArea
                      id="store-hours"
                      value={draft.hoursText ?? ""}
                      onChange={(e) =>
                        setDraft((d) =>
                          d ? { ...d, hoursText: e.target.value } : d,
                        )
                      }
                      placeholder={t("storeHoursPlaceholder")}
                    />
                  </Field>

                  <PrimaryBtn type="submit" disabled={saving}>
                    {saving ? t("saving") : t("saveStoreSetup")}
                  </PrimaryBtn>
                </Form>
              </Card>

              <Card style={{ marginTop: 14 }}>
                <SectionTitle>{t("myProductsTitle")}</SectionTitle>
                {loadingMyProducts ? (
                  <Muted>{t("loadingProducts")}</Muted>
                ) : null}
                {myProductsError ? (
                  <Muted role="alert">{myProductsError}</Muted>
                ) : null}
                {!loadingMyProducts &&
                !myProductsError &&
                myProducts.length === 0 ? (
                  <Muted>{t("noProductsYet")}</Muted>
                ) : null}

                {myProducts.length > 0 ? (
                  <ProductList>
                    {myProducts.map((p) => (
                      <ProductRow key={p.id}>
                        <ProductThumb aria-hidden={!p.image}>
                          {p.image ? (
                            <ProductThumbImg
                              src={p.image}
                              alt={p.title}
                              loading="lazy"
                            />
                          ) : null}
                        </ProductThumb>
                        <div>
                          <ProductTitle>{p.title}</ProductTitle>
                          <ProductMeta>
                            {formatCurrencyZar(p.price)}
                            {p.unit ? ` • ${p.unit}` : ""}
                          </ProductMeta>
                        </div>
                      </ProductRow>
                    ))}
                  </ProductList>
                ) : null}

                <Actions style={{ marginTop: 12 }}>
                  <PrimaryLink href={storePublicUrl(draft)}>
                    {t("viewStoreInShop")}
                  </PrimaryLink>
                </Actions>
              </Card>

              <Card style={{ marginTop: 14 }}>
                <SectionTitle>{t("addProductTitle")}</SectionTitle>
                {!draft.isActive ? (
                  <WarnMsg role="status">
                    {t("storeNotActiveWarning")}
                    <div style={{ marginTop: 10 }}>
                      <PrimaryBtn
                        type="button"
                        disabled={saving}
                        onClick={() => void activateSelectedStore()}
                      >
                        {saving ? t("activating") : t("activateStore")}
                      </PrimaryBtn>
                    </div>
                  </WarnMsg>
                ) : null}
                <Form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!session || !draft) return;
                    setProductError(null);
                    setProductSuccess(null);
                    if (!productTitle.trim()) {
                      setProductError(t("errEnterProductName"));
                      return;
                    }
                    const p = Number(productPrice.replace(",", "."));
                    if (!Number.isFinite(p) || p <= 0) {
                      setProductError(t("errEnterValidPrice"));
                      return;
                    }

                    setCreatingProduct(true);
                    try {
                      const res = await fetch("/api/products", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          phone: session.phone,
                          storeId: draft.id,
                          title: productTitle.trim(),
                          price: p,
                          unit: null,
                          image: productImage.trim()
                            ? productImage.trim()
                            : null,
                        }),
                      });
                      const data: unknown = await res.json().catch(() => null);
                      if (!res.ok) {
                        const msg =
                          data &&
                          typeof data === "object" &&
                          "error" in data &&
                          typeof (data as { error: unknown }).error === "string"
                            ? (data as { error: string }).error
                            : t("errCouldNotCreateProduct");
                        throw new Error(msg);
                      }
                      setProductTitle("");
                      setProductPrice("");
                      setProductImage("");
                      setProductSuccess(t("productCreated"));
                      await loadMyProducts(session.phone, draft.id);
                    } catch (e2) {
                      setProductError(
                        e2 instanceof Error ? e2.message : t("errUnknown"),
                      );
                    } finally {
                      setCreatingProduct(false);
                    }
                  }}
                >
                  {productError ? (
                    <ErrorMsg role="alert">{productError}</ErrorMsg>
                  ) : null}
                  {productSuccess ? (
                    <SuccessMsg>{productSuccess}</SuccessMsg>
                  ) : null}

                  <Field>
                    <Label htmlFor="prod-title">{t("productNameLabel")}</Label>
                    <Input
                      id="prod-title"
                      value={productTitle}
                      onChange={(e) => {
                        setProductTitle(e.target.value);
                        setProductError(null);
                        setProductSuccess(null);
                      }}
                      placeholder={t("productNamePlaceholder")}
                      required
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="prod-price">{t("productPriceLabel")}</Label>
                    <Input
                      id="prod-price"
                      inputMode="decimal"
                      value={productPrice}
                      onChange={(e) => {
                        setProductPrice(e.target.value);
                        setProductError(null);
                        setProductSuccess(null);
                      }}
                      placeholder={t("productPricePlaceholder")}
                      required
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="prod-image-file">
                      {t("productPhotoLabel")}
                    </Label>
                    <FileInput
                      id="prod-image-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setProductError(null);
                        setProductSuccess(null);
                        const file = e.target.files?.[0] ?? null;
                        if (!file) {
                          setProductImage("");
                          return;
                        }
                        if (!file.type.startsWith("image/")) {
                          setProductError(t("errChooseImage"));
                          return;
                        }
                        if (file.size > 2 * 1024 * 1024) {
                          setProductError(t("errImageTooLarge"));
                          return;
                        }
                        void (async () => {
                          try {
                            const cropped = await fileToCroppedDataUrl(file, {
                              aspect: "productPortrait",
                              maxSize: 1200,
                              mimeType: "image/webp",
                              quality: 0.9,
                            });
                            setProductImage(cropped);
                          } catch (err) {
                            setProductError(
                              err instanceof Error
                                ? err.message
                                : t("errCouldNotReadFile"),
                            );
                          }
                        })();
                      }}
                    />
                    {productImage ? (
                      <PreviewBox aria-label={t("productPhotoPreviewAria")}>
                        <PreviewImg
                          src={productImage}
                          alt={t("productPhotoPreviewAlt")}
                        />
                      </PreviewBox>
                    ) : null}
                    <Hint>{t("productUploadHint")}</Hint>
                  </Field>

                  <PrimaryBtn type="submit" disabled={creatingProduct}>
                    {creatingProduct ? t("creating") : t("createProduct")}
                  </PrimaryBtn>
                </Form>
              </Card>
            </>
          ) : null}
        </div>
      </Layout>
    </Page>
  );
}
