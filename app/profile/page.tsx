"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styled from "styled-components";
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

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 1.375rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  margin: 0 0 18px;
  font-size: 0.95rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Card = styled.div`
  padding: 16px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 10px rgba(0, 0, 0, 0.06);
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const Key = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Value = styled.div`
  color: ${({ theme }) => theme.colors.textDark};
  word-break: break-word;
`;

const Actions = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Btn = styled.button`
  min-height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background: #ffffff;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const ShopLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const SectionTitle = styled.h2`
  margin: 18px 0 10px;
  font-size: 1rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textDark};
`;

const StoreGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 16px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const StoreBtn = styled.button<{ $active: boolean }>`
  text-align: left;
  width: 100%;
  border: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : "#e2e2de")};
  background: ${({ $active }) =>
    $active ? "rgba(46, 94, 62, 0.06)" : "#ffffff"};
  border-radius: 14px;
  padding: 14px 14px 12px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const StoreName = styled.div`
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textDark};
`;

const StoreMeta = styled.div`
  margin-top: 4px;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textLight};
  word-break: break-word;
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
  min-height: 84px;
  overflow: hidden;
`;

const PreviewImg = styled.img`
  max-width: 100%;
  max-height: 160px;
  object-fit: contain;
  display: block;
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

export default function ProfilePage() {
  // Hydration-safe: render a stable “logged out” view first, then load localStorage after mount.
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [initialStoreParam] = useState(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("store");
  });
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [creatingStore, setCreatingStore] = useState(false);
  const [productTitle, setProductTitle] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productUnit, setProductUnit] = useState("");
  const [productImage, setProductImage] = useState("");
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [productSuccess, setProductSuccess] = useState<string | null>(null);

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
        if (!res.ok) throw new Error("Kon nie winkels laai nie.");
        const list =
          data && typeof data === "object" && "stores" in data
            ? (data as { stores: unknown }).stores
            : null;
        if (!Array.isArray(list)) throw new Error("Ongeldige antwoord.");
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
          setStoreError(e instanceof Error ? e.message : "Onbekende fout.");
      } finally {
        if (!cancelled) setLoadingStores(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, session, initialStoreParam]);

  const selected = stores.find((s) => s.id === selectedStoreId) ?? null;
  const [draft, setDraft] = useState<StoreRow | null>(() => selected);

  // When switching stores, copy fields into the editor.
  // This page is intentionally localStorage/API-driven; we accept the effect update here.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setDraft(selected);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [selectedStoreId, selected]);

  if (!hydrated || !session) {
    return (
      <>
        <Title>Profiel</Title>
        <Subtitle>Jy is nie ingeteken nie.</Subtitle>
        <ShopLink href="/shop">Gaan na winkel</ShopLink>
      </>
    );
  }

  const isSeller = stores.length > 0;

  if (isSeller) {
    return (
      <>
        <Title>Profiel</Title>
        <Subtitle>Bestuur jou winkels en voltooi jou store setup.</Subtitle>

        <SectionTitle>Jou winkels</SectionTitle>
        {loadingStores ? <Subtitle>Laai winkels…</Subtitle> : null}
        {storeError ? <Subtitle role="alert">{storeError}</Subtitle> : null}

        <Card style={{ marginBottom: 12 }}>
          <Form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!session) return;
              if (!newStoreName.trim()) {
                setStoreError("Vul ’n winkelnaam in.");
                return;
              }
              setStoreError(null);
              setCreatingStore(true);
              try {
                const res = await fetch("/api/stores/my", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    phone: session.phone,
                    name: newStoreName.trim(),
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
                      : "Kon nie winkel skep nie.";
                  throw new Error(msg);
                }
                const storeId =
                  data &&
                  typeof data === "object" &&
                  "storeId" in data &&
                  typeof (data as { storeId: unknown }).storeId === "string"
                    ? (data as { storeId: string }).storeId
                    : null;
                const slug =
                  data &&
                  typeof data === "object" &&
                  "slug" in data &&
                  typeof (data as { slug: unknown }).slug === "string"
                    ? (data as { slug: string }).slug
                    : null;
                if (!storeId || !slug) throw new Error("Ongeldige antwoord.");

                const row: StoreRow = {
                  id: storeId,
                  name: newStoreName.trim(),
                  slug,
                  isActive: false,
                  brandColor: "#2E5E3E",
                  logoUrl: null,
                  addressText: null,
                  email: null,
                  whatsapp: null,
                  instagram: null,
                  facebook: null,
                  website: null,
                  hoursText: null,
                };

                setStores((prev) => [row, ...prev]);
                setSelectedStoreId(storeId);
                setNewStoreName("");
              } catch (e2) {
                setStoreError(
                  e2 instanceof Error ? e2.message : "Onbekende fout.",
                );
              } finally {
                setCreatingStore(false);
              }
            }}
          >
            <Field>
              <Label htmlFor="new-store-name">Skep ’n nuwe winkel</Label>
              <Input
                id="new-store-name"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="Bv. Botha Bakery"
              />
              <Hint>
                Jy kan meer as een winkel hê (bv. brood en leer as verskillende
                winkels).
              </Hint>
            </Field>
            <PrimaryBtn type="submit" disabled={creatingStore}>
              {creatingStore ? "Skep…" : "Skep winkel"}
            </PrimaryBtn>
          </Form>
        </Card>

        {stores.length > 0 ? (
          <StoreGrid>
            {stores.map((s) => (
              <StoreBtn
                key={s.id}
                type="button"
                $active={s.id === selectedStoreId}
                onClick={() => setSelectedStoreId(s.id)}
              >
                <StoreName>{s.name}</StoreName>
                <StoreMeta>
                  {s.isActive ? "Aktief" : "Nie aktief"} • /shop/{s.slug}--
                  {s.id}
                </StoreMeta>
              </StoreBtn>
            ))}
          </StoreGrid>
        ) : (
          <Subtitle>Geen winkels nog nie. Skep jou eerste winkel.</Subtitle>
        )}

        {draft ? (
          <>
            <SectionTitle>Store setup</SectionTitle>
            <Card>
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
                          : "Kon nie stoor nie.";
                      throw new Error(msg);
                    }
                    setStores((prev) =>
                      prev.map((s) =>
                        s.id === draft.id ? { ...s, ...draft } : s,
                      ),
                    );
                  } catch (e2) {
                    setStoreError(
                      e2 instanceof Error ? e2.message : "Onbekende fout.",
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <Field>
                  <Label htmlFor="store-name">Store naam</Label>
                  <Input
                    id="store-name"
                    value={draft.name}
                    onChange={(e) =>
                      setDraft((d) => (d ? { ...d, name: e.target.value } : d))
                    }
                    required
                  />
                </Field>

                <Field>
                  <Label htmlFor="store-active">Aktief</Label>
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
                      As aktief, kan klante jou winkel sien by /shop/
                      {draft.slug}--{draft.id}.
                    </Hint>
                  </ToggleRow>
                </Field>

                <Field>
                  <Label htmlFor="store-address">Adres (pickup/delivery)</Label>
                  <TextArea
                    id="store-address"
                    value={draft.addressText ?? ""}
                    onChange={(e) =>
                      setDraft((d) =>
                        d ? { ...d, addressText: e.target.value } : d,
                      )
                    }
                    placeholder="Straat, dorp, provinsie…"
                  />
                </Field>

                <Field>
                  <Label htmlFor="store-whatsapp">WhatsApp</Label>
                  <Input
                    id="store-whatsapp"
                    value={draft.whatsapp ?? ""}
                    onChange={(e) =>
                      setDraft((d) =>
                        d ? { ...d, whatsapp: e.target.value } : d,
                      )
                    }
                    placeholder="Bv. 082 123 4567"
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
                    placeholder="@jouwinkel"
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
                    placeholder="facebook.com/…"
                  />
                </Field>

                <Field>
                  <Label htmlFor="store-website">Website</Label>
                  <Input
                    id="store-website"
                    value={draft.website ?? ""}
                    onChange={(e) =>
                      setDraft((d) =>
                        d ? { ...d, website: e.target.value } : d,
                      )
                    }
                    placeholder="https://…"
                  />
                </Field>

                <Field>
                  <Label htmlFor="store-hours">Bedryfsure</Label>
                  <TextArea
                    id="store-hours"
                    value={draft.hoursText ?? ""}
                    onChange={(e) =>
                      setDraft((d) =>
                        d ? { ...d, hoursText: e.target.value } : d,
                      )
                    }
                    placeholder={"Ma–Vr: 08:00–17:00\nSa: 08:00–12:00\nSo: toe"}
                  />
                </Field>

                <PrimaryBtn type="submit" disabled={saving}>
                  {saving ? "Stoor…" : "Stoor store setup"}
                </PrimaryBtn>
              </Form>
            </Card>

            <SectionTitle>Voeg produk by</SectionTitle>
            <Card>
              <Form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!session || !draft) return;
                  setProductError(null);
                  setProductSuccess(null);
                  if (!productTitle.trim()) {
                    setProductError("Vul ’n produknaam in.");
                    return;
                  }
                  const p = Number(productPrice.replace(",", "."));
                  if (!Number.isFinite(p) || p <= 0) {
                    setProductError("Vul ’n geldige prys in.");
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
                        unit: productUnit.trim() ? productUnit.trim() : null,
                        image: productImage.trim() ? productImage.trim() : null,
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
                          : "Kon nie produk skep nie.";
                      throw new Error(msg);
                    }
                    setProductTitle("");
                    setProductPrice("");
                    setProductUnit("");
                    setProductImage("");
                    setProductSuccess(
                      "Produk geskep! Gaan kyk by die winkellys.",
                    );
                  } catch (e2) {
                    setProductError(
                      e2 instanceof Error ? e2.message : "Onbekende fout.",
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
                  <Label htmlFor="prod-title">Produk naam</Label>
                  <Input
                    id="prod-title"
                    value={productTitle}
                    onChange={(e) => {
                      setProductTitle(e.target.value);
                      setProductError(null);
                      setProductSuccess(null);
                    }}
                    placeholder="Bv. Vars brood"
                    required
                  />
                </Field>

                <Field>
                  <Label htmlFor="prod-price">Prys (R)</Label>
                  <Input
                    id="prod-price"
                    inputMode="decimal"
                    value={productPrice}
                    onChange={(e) => {
                      setProductPrice(e.target.value);
                      setProductError(null);
                      setProductSuccess(null);
                    }}
                    placeholder="Bv. 45.00"
                    required
                  />
                </Field>

                <Field>
                  <Label htmlFor="prod-unit">Eenheid (opsioneel)</Label>
                  <Input
                    id="prod-unit"
                    value={productUnit}
                    onChange={(e) => {
                      setProductUnit(e.target.value);
                      setProductError(null);
                      setProductSuccess(null);
                    }}
                    placeholder="Bv. per loaf / per kg"
                  />
                </Field>

                <Field>
                  <Label htmlFor="prod-image-file">
                    Produk foto (opsioneel)
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
                        setProductError(
                          "Kies asseblief ’n prent (PNG/JPG/WebP).",
                        );
                        return;
                      }
                      if (file.size > 2 * 1024 * 1024) {
                        setProductError("Foto is te groot. Hou dit onder 2MB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onerror = () =>
                        setProductError("Kon nie lêer lees nie.");
                      reader.onload = () =>
                        setProductImage(String(reader.result ?? ""));
                      reader.readAsDataURL(file);
                    }}
                  />
                  {productImage ? (
                    <PreviewBox aria-label="Produk foto preview">
                      <PreviewImg
                        src={productImage}
                        alt="Produk foto preview"
                      />
                    </PreviewBox>
                  ) : null}
                  <Hint>
                    Hierdie is ’n eenvoudige upload vir nou (maks 2MB). Ons
                    stoor dit as ’n data URL.
                  </Hint>
                </Field>

                <PrimaryBtn type="submit" disabled={creatingProduct}>
                  {creatingProduct ? "Skep…" : "Skep produk"}
                </PrimaryBtn>
              </Form>
            </Card>
          </>
        ) : null}

        <Actions>
          <ShopLink href="/shop">Winkel</ShopLink>
          <Btn
            type="button"
            onClick={() => {
              clearStoredSession();
              setSession(null);
            }}
          >
            Teken uit
          </Btn>
        </Actions>
      </>
    );
  }

  return (
    <>
      <Title>Profiel</Title>
      <Subtitle>Jou besonderhede is gestoor op hierdie toestel.</Subtitle>
      <Card>
        <Row>
          <Key>Naam</Key>
          <Value>{session.name}</Value>
        </Row>
        <Row>
          <Key>Foon</Key>
          <Value>{session.phone}</Value>
        </Row>
      </Card>

      <SectionTitle>Jou winkel</SectionTitle>
      {loadingStores ? <Subtitle>Laai winkels…</Subtitle> : null}
      {storeError ? <Subtitle role="alert">{storeError}</Subtitle> : null}
      {!loadingStores && stores.length === 0 ? (
        <CtaCard>
          <Subtitle style={{ margin: 0 }}>
            Jy het nog geen winkels nie. Skep jou eerste winkel om produkte te
            lys en bestellings te ontvang.
          </Subtitle>
          <ShopLink href="/register?role=seller">
            Skep jou eerste winkel
          </ShopLink>
        </CtaCard>
      ) : null}

      <Actions>
        <ShopLink href="/shop">Winkel</ShopLink>
        <Btn
          type="button"
          onClick={() => {
            clearStoredSession();
            setSession(null);
          }}
        >
          Teken uit
        </Btn>
      </Actions>
    </>
  );
}
