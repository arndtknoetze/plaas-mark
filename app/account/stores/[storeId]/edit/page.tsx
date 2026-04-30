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
  SecondaryLink,
  ActionsRow,
} from "@/components/account/ui";
import { fileToCroppedDataUrl } from "@/lib/image-crop";
import { useLanguage } from "@/lib/useLanguage";
import { loadStoredSession, type StoredSession } from "@/lib/session-storage";
import { useResolvedLocationSlug } from "@/lib/useResolvedLocationSlug";

type StoreInfo = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  brandColor: string;
  logoUrl: string | null;
  addressText: string | null;
  hoursText: string | null;
  whatsapp: string | null;
};

type StoreDashboardResponse = { store: StoreInfo };

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

const TextArea = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 12px 16px;
  border: 1px solid #eee;
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
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 6px;
  background: #ffffff;
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

const LogoPreviewBox = styled.div`
  margin-top: 8px;
  border: 1px solid #eee;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-weight: 800;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition:
    transform 0.12s ease,
    background 0.12s ease,
    box-shadow 0.12s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
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

function isStoreDashboardResponse(
  value: unknown,
): value is StoreDashboardResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!v.store || typeof v.store !== "object") return false;
  return true;
}

export default function AccountEditStorePage({
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [store, setStore] = useState<StoreInfo | null>(null);

  const [name, setName] = useState("");
  const [brandColor, setBrandColor] = useState("#2E5E3E");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [whatsapp, setWhatsapp] = useState("");
  const [addressText, setAddressText] = useState("");
  const [hoursText, setHoursText] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      setSession(loadStoredSession());
      setBootstrapped(true);
    });
  }, []);

  useEffect(() => {
    if (!bootstrapped || !session) return;
    let cancelled = false;
    (async () => {
      setError(null);
      setSuccess(null);
      setLoading(true);
      try {
        const res = await fetch(
          `/api/account/store-dashboard?storeId=${encodeURIComponent(storeId)}${locationQuery}`,
          { cache: "no-store" },
        );
        const json: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            json &&
            typeof json === "object" &&
            "error" in json &&
            typeof (json as { error?: unknown }).error === "string"
              ? (json as { error: string }).error
              : t("errUnknown");
          throw new Error(msg);
        }
        if (!isStoreDashboardResponse(json))
          throw new Error(t("errInvalidServerResponse"));

        const s = (json as StoreDashboardResponse).store;
        if (cancelled) return;
        setStore(s);
        setName(s.name);
        setBrandColor(s.brandColor || "#2E5E3E");
        setLogoUrl(s.logoUrl);
        setIsActive(Boolean(s.isActive));
        setWhatsapp(s.whatsapp ?? "");
        setAddressText(s.addressText ?? "");
        setHoursText(s.hoursText ?? "");
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
  }, [bootstrapped, locationQuery, storeId, session, t]);

  return (
    <FullBleed>
      <DashboardPage>
        <PageHeader>
          <PageTitle>{store ? `Edit ${store.name}` : "Edit store"}</PageTitle>
          <PageSubtitle>
            <Link href={`/account/stores/${encodeURIComponent(storeId)}`}>
              Back to store dashboard
            </Link>
          </PageSubtitle>
        </PageHeader>

        <Card>
          <CardTitle>Store settings</CardTitle>
          {loading ? <Muted>{t("loading")}</Muted> : null}
          {error ? <ErrorMsg role="alert">{error}</ErrorMsg> : null}
          {success ? <SuccessMsg role="status">{success}</SuccessMsg> : null}

          {!loading && store ? (
            <Form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!session) return;
                setError(null);
                setSuccess(null);
                setSaving(true);
                try {
                  const res = await fetch(`/api/stores/${store.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name,
                      brandColor,
                      logoUrl,
                      isActive,
                      whatsapp,
                      addressText,
                      hoursText,
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
                        : t("errUnknown");
                    throw new Error(msg);
                  }
                  setSuccess("Saved.");
                } catch (e2) {
                  setError(e2 instanceof Error ? e2.message : t("errUnknown"));
                } finally {
                  setSaving(false);
                }
              }}
            >
              <Field>
                <Label htmlFor="store-name">{t("storeNameLabel")}</Label>
                <Input
                  id="store-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="store-brandColor">{t("brandColorLabel")}</Label>
                <ColorRow>
                  <ColorSwatch
                    id="store-brandColor"
                    type="color"
                    value={brandColor || "#2E5E3E"}
                    onChange={(e) => setBrandColor(e.target.value)}
                    aria-label={t("brandColorAria")}
                  />
                  <Input
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#2E5E3E"
                    inputMode="text"
                  />
                </ColorRow>
              </Field>

              <Field>
                <Label htmlFor="store-logo-file">{t("storeLogoLabel")}</Label>
                <FileInput
                  id="store-logo-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setError(null);
                    setSuccess(null);
                    const file = e.target.files?.[0] ?? null;
                    if (!file) return;
                    if (!file.type.startsWith("image/")) {
                      setError(t("errChooseImage"));
                      return;
                    }
                    if (file.size > 2 * 1024 * 1024) {
                      setError(t("errImageTooLarge"));
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
                        setLogoUrl(cropped);
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : t("errUnknown"),
                        );
                      }
                    })();
                  }}
                />
                {logoUrl ? (
                  <LogoPreviewBox aria-label={t("logoPreviewAria")}>
                    <LogoPreviewImg src={logoUrl} alt={t("logoPreviewAlt")} />
                  </LogoPreviewBox>
                ) : null}
              </Field>

              <Field>
                <Label htmlFor="store-active">{t("storeActiveLabel")}</Label>
                <ToggleRow>
                  <Toggle
                    id="store-active"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <Muted>
                    {isActive ? "Visible in shop" : "Hidden from shop"}
                  </Muted>
                </ToggleRow>
              </Field>

              <Field>
                <Label htmlFor="store-whatsapp">
                  {t("storeWhatsappLabel")}
                </Label>
                <Input
                  id="store-whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder={t("storeWhatsappPlaceholder")}
                />
              </Field>

              <Field>
                <Label htmlFor="store-address">{t("storeAddressLabel")}</Label>
                <TextArea
                  id="store-address"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder={t("storeAddressPlaceholder")}
                />
              </Field>

              <Field>
                <Label htmlFor="store-hours">{t("storeHoursLabel")}</Label>
                <TextArea
                  id="store-hours"
                  value={hoursText}
                  onChange={(e) => setHoursText(e.target.value)}
                  placeholder={t("storeHoursPlaceholder")}
                />
              </Field>

              <ActionsRow style={{ marginTop: 4 }}>
                <PrimaryButton type="submit" disabled={saving}>
                  {saving ? t("saving") : t("saveStoreSetup")}
                </PrimaryButton>
                <SecondaryLink
                  href={`/account/stores/${encodeURIComponent(storeId)}`}
                >
                  Cancel
                </SecondaryLink>
              </ActionsRow>
            </Form>
          ) : null}
        </Card>
      </DashboardPage>
    </FullBleed>
  );
}
