"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Card,
  CardTitle,
  DashboardPage,
  FullBleed,
  Muted,
  PageHeader,
  PageSubtitle,
  PageTitle,
  ActionsRow,
  PrimaryLink,
  SecondaryLink,
  formatCurrencyZar,
} from "@/components/account/ui";
import { fileToCroppedDataUrl } from "@/lib/image-crop";
import { useLanguage } from "@/lib/useLanguage";
import { loadStoredSession, type StoredSession } from "@/lib/session-storage";
import { useResolvedLocationSlug } from "@/lib/useResolvedLocationSlug";

type MyProductRow = {
  id: string;
  title: string;
  price: number;
  unit?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Input = styled.input`
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid #eee;
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

const FileInput = styled.input`
  width: 100%;
  min-height: 50px;
  padding: 10px 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  box-sizing: border-box;
`;

const PreviewBox = styled.div`
  margin-top: 8px;
  border: 1px solid #eee;
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

const PrimaryButton = styled.button`
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
    transform 0.12s ease,
    background 0.12s ease,
    opacity 0.12s ease,
    box-shadow 0.12s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
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

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const ProductRow = styled.div`
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #ffffff;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #e5e5e5;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }
`;

const ProductTop = styled.div`
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;
  align-items: center;
`;

const Thumb = styled.div`
  width: 56px;
  aspect-ratio: 4 / 5;
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ProdTitle = styled.div`
  font-weight: 950;
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.15;
`;

const ProdMeta = styled.div`
  margin-top: 6px;
  font-size: 0.85rem;
  color: #777;
`;

const RowActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const SmallBtn = styled.button<{ $danger?: boolean }>`
  min-height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid ${({ $danger }) => ($danger ? "#f0c4c4" : "#eee")};
  background: #ffffff;
  color: ${({ theme, $danger }) =>
    $danger ? "#8a1c1c" : theme.colors.textDark};
  font-weight: 800;
  font-size: 0.95rem;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease,
    background 0.12s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.colors.background};
    border-color: #e5e5e5;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const EditGrid = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.background};
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 840px) {
    grid-template-columns: 1.2fr 1fr 1fr;
    align-items: end;
  }
`;

function isProductsResponse(
  value: unknown,
): value is { products: MyProductRow[] } {
  if (!value || typeof value !== "object") return false;
  const v = value as { products?: unknown };
  return Array.isArray(v.products);
}

export default function AccountStoreProductsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);
  const { t } = useLanguage();
  const location = useResolvedLocationSlug();
  const locationQuery = useMemo(
    () => (location ? `&location=${encodeURIComponent(location)}` : ""),
    [location],
  );

  const [bootstrapped, setBootstrapped] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<MyProductRow[]>([]);

  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editImage, setEditImage] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products/my?storeId=${encodeURIComponent(storeId)}${locationQuery}`,
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
      if (!isProductsResponse(data))
        throw new Error(t("errInvalidServerResponse"));
      setProducts(data.products);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errUnknown"));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      setSession(loadStoredSession());
      setBootstrapped(true);
    });
  }, []);

  useEffect(() => {
    if (!bootstrapped || !session) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- effect coordinates async fetch
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when session/store changes
  }, [bootstrapped, session, storeId, locationQuery]);

  if (!bootstrapped || !session) {
    return (
      <FullBleed>
        <DashboardPage>
          <PageHeader>
            <PageTitle>Products</PageTitle>
            <PageSubtitle>Sign in to manage products.</PageSubtitle>
          </PageHeader>
          <Card>
            <CardTitle>{t("account")}</CardTitle>
            <Muted>
              <Link href="/account">Back to dashboard</Link>
            </Muted>
          </Card>
        </DashboardPage>
      </FullBleed>
    );
  }

  const startEdit = (p: MyProductRow) => {
    setRowError(null);
    setEditingId(p.id);
    setEditTitle(p.title);
    setEditPrice(String(p.price));
    setEditUnit(p.unit ?? "");
    setEditImage(p.image ?? "");
  };

  return (
    <FullBleed>
      <DashboardPage>
        <PageHeader>
          <PageTitle>Products</PageTitle>
          <PageSubtitle>
            <Link href={`/account/stores/${encodeURIComponent(storeId)}`}>
              Back to store dashboard
            </Link>
          </PageSubtitle>
        </PageHeader>

        <Card>
          <CardTitle>Add product</CardTitle>
          <Form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!session) return;
              setCreateError(null);
              setCreateSuccess(null);

              if (!newTitle.trim()) {
                setCreateError(t("errEnterProductName"));
                return;
              }
              const p = Number(newPrice.replace(",", "."));
              if (!Number.isFinite(p) || p <= 0) {
                setCreateError(t("errEnterValidPrice"));
                return;
              }

              setCreating(true);
              try {
                const res = await fetch("/api/products", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    storeId,
                    title: newTitle.trim(),
                    price: p,
                    unit: null,
                    image: newImage.trim() ? newImage.trim() : null,
                  }),
                });
                const data: unknown = await res.json().catch(() => null);
                if (!res.ok) {
                  const msg =
                    data &&
                    typeof data === "object" &&
                    "error" in data &&
                    typeof (data as { error?: unknown }).error === "string"
                      ? (data as { error: string }).error
                      : t("errCouldNotCreateProduct");
                  throw new Error(msg);
                }
                setNewTitle("");
                setNewPrice("");
                setNewImage("");
                setCreateSuccess(t("productCreated"));
                await load();
              } catch (e2) {
                setCreateError(
                  e2 instanceof Error ? e2.message : t("errUnknown"),
                );
              } finally {
                setCreating(false);
              }
            }}
          >
            {createError ? (
              <ErrorMsg role="alert">{createError}</ErrorMsg>
            ) : null}
            {createSuccess ? (
              <SuccessMsg role="status">{createSuccess}</SuccessMsg>
            ) : null}

            <Field>
              <Label htmlFor="new-title">{t("productNameLabel")}</Label>
              <Input
                id="new-title"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setCreateError(null);
                  setCreateSuccess(null);
                }}
                placeholder={t("productNamePlaceholder")}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="new-price">{t("productPriceLabel")}</Label>
              <Input
                id="new-price"
                inputMode="decimal"
                value={newPrice}
                onChange={(e) => {
                  setNewPrice(e.target.value);
                  setCreateError(null);
                  setCreateSuccess(null);
                }}
                placeholder={t("productPricePlaceholder")}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="new-image-file">{t("productPhotoLabel")}</Label>
              <FileInput
                id="new-image-file"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setCreateError(null);
                  setCreateSuccess(null);
                  const file = e.target.files?.[0] ?? null;
                  if (!file) {
                    setNewImage("");
                    return;
                  }
                  if (!file.type.startsWith("image/")) {
                    setCreateError(t("errChooseImage"));
                    return;
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    setCreateError(t("errImageTooLarge"));
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
                      setNewImage(cropped);
                    } catch (err) {
                      setCreateError(
                        err instanceof Error
                          ? err.message
                          : t("errCouldNotReadFile"),
                      );
                    }
                  })();
                }}
              />
              {newImage ? (
                <PreviewBox aria-label={t("productPhotoPreviewAria")}>
                  <PreviewImg
                    src={newImage}
                    alt={t("productPhotoPreviewAlt")}
                  />
                </PreviewBox>
              ) : null}
            </Field>

            <PrimaryButton type="submit" disabled={creating}>
              {creating ? t("creating") : t("createProduct")}
            </PrimaryButton>
          </Form>
        </Card>

        <Card>
          <CardTitle>All products</CardTitle>
          <ActionsRow>
            <SecondaryLink
              href={`/account/stores/${encodeURIComponent(storeId)}`}
            >
              Back to store
            </SecondaryLink>
            <SecondaryLink href="/account/stores">All stores</SecondaryLink>
            <PrimaryLink href="/account">Dashboard</PrimaryLink>
          </ActionsRow>

          {loading ? <Muted>{t("loadingProducts")}</Muted> : null}
          {error ? <Muted role="alert">{error}</Muted> : null}
          {rowError ? <ErrorMsg role="alert">{rowError}</ErrorMsg> : null}

          {!loading && !error && products.length === 0 ? (
            <Muted>No products yet.</Muted>
          ) : null}

          {products.length > 0 ? (
            <ProductList>
              {products.map((p) => (
                <ProductRow key={p.id}>
                  <ProductTop>
                    <Thumb aria-hidden={!p.image}>
                      {p.image ? (
                        <ThumbImg src={p.image} alt={p.title} />
                      ) : null}
                    </Thumb>
                    <div style={{ minWidth: 0 }}>
                      <ProdTitle>{p.title}</ProdTitle>
                      <ProdMeta>
                        {formatCurrencyZar(p.price)}
                        {p.unit ? ` • ${p.unit}` : ""}
                      </ProdMeta>
                    </div>
                    <RowActions>
                      <SmallBtn
                        type="button"
                        onClick={() => startEdit(p)}
                        disabled={savingId === p.id}
                      >
                        Edit
                      </SmallBtn>
                      <SmallBtn
                        type="button"
                        $danger
                        disabled={savingId === p.id}
                        onClick={() => {
                          if (!confirm("Delete this product?")) return;
                          setRowError(null);
                          setSavingId(p.id);
                          void (async () => {
                            try {
                              const res = await fetch(
                                `/api/products/${encodeURIComponent(p.id)}`,
                                {
                                  method: "DELETE",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({}),
                                },
                              );
                              const data: unknown = await res
                                .json()
                                .catch(() => null);
                              if (!res.ok) {
                                const msg =
                                  data &&
                                  typeof data === "object" &&
                                  "error" in data &&
                                  typeof (data as { error?: unknown }).error ===
                                    "string"
                                    ? (data as { error: string }).error
                                    : t("errUnknown");
                                throw new Error(msg);
                              }
                              await load();
                            } catch (err) {
                              setRowError(
                                err instanceof Error
                                  ? err.message
                                  : t("errUnknown"),
                              );
                            } finally {
                              setSavingId(null);
                            }
                          })();
                        }}
                      >
                        Delete
                      </SmallBtn>
                    </RowActions>
                  </ProductTop>

                  {editingId === p.id ? (
                    <EditGrid>
                      <div>
                        <Label htmlFor={`edit-title-${p.id}`}>Title</Label>
                        <Input
                          id={`edit-title-${p.id}`}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-price-${p.id}`}>Price</Label>
                        <Input
                          id={`edit-price-${p.id}`}
                          inputMode="decimal"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-unit-${p.id}`}>Unit</Label>
                        <Input
                          id={`edit-unit-${p.id}`}
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value)}
                          placeholder="e.g. kg"
                        />
                      </div>

                      <div style={{ gridColumn: "1 / -1" }}>
                        <Label htmlFor={`edit-image-${p.id}`}>Image URL</Label>
                        <Input
                          id={`edit-image-${p.id}`}
                          value={editImage}
                          onChange={(e) => setEditImage(e.target.value)}
                          placeholder="https://..."
                        />
                      </div>

                      <div style={{ gridColumn: "1 / -1" }}>
                        <RowActions style={{ justifyContent: "flex-start" }}>
                          <SmallBtn
                            type="button"
                            disabled={savingId === p.id}
                            onClick={() => {
                              setRowError(null);
                              setSavingId(p.id);
                              void (async () => {
                                try {
                                  const price = Number(
                                    editPrice.replace(",", "."),
                                  );
                                  if (!editTitle.trim())
                                    throw new Error("Title is required.");
                                  if (!Number.isFinite(price) || price <= 0)
                                    throw new Error("Enter a valid price.");

                                  const res = await fetch(
                                    `/api/products/${encodeURIComponent(p.id)}`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        title: editTitle.trim(),
                                        price,
                                        unit: editUnit.trim()
                                          ? editUnit.trim()
                                          : null,
                                        image: editImage.trim()
                                          ? editImage.trim()
                                          : null,
                                      }),
                                    },
                                  );
                                  const data: unknown = await res
                                    .json()
                                    .catch(() => null);
                                  if (!res.ok) {
                                    const msg =
                                      data &&
                                      typeof data === "object" &&
                                      "error" in data &&
                                      typeof (data as { error?: unknown })
                                        .error === "string"
                                        ? (data as { error: string }).error
                                        : t("errUnknown");
                                    throw new Error(msg);
                                  }
                                  setEditingId(null);
                                  await load();
                                } catch (err) {
                                  setRowError(
                                    err instanceof Error
                                      ? err.message
                                      : t("errUnknown"),
                                  );
                                } finally {
                                  setSavingId(null);
                                }
                              })();
                            }}
                          >
                            Save
                          </SmallBtn>
                          <SmallBtn
                            type="button"
                            disabled={savingId === p.id}
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </SmallBtn>
                        </RowActions>
                      </div>
                    </EditGrid>
                  ) : null}
                </ProductRow>
              ))}
            </ProductList>
          ) : null}
        </Card>
      </DashboardPage>
    </FullBleed>
  );
}
