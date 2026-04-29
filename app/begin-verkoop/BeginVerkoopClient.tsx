"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { AccountOtpForm } from "@/components/AccountOtpForm";
import { useToast } from "@/components/ToastProvider";
import { useLanguage } from "@/lib/useLanguage";
import { loadStoredSession, type StoredSession } from "@/lib/session-storage";
import { useResolvedLocationSlug } from "@/lib/useResolvedLocationSlug";

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

const BackLink = styled(Link)`
  display: inline-block;
  margin-top: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
    border-radius: 4px;
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

const ErrorMsg = styled.p`
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #8a1c1c;
  background: #fdeaea;
  border: 1px solid #f0c4c4;
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

const Card = styled.div`
  padding: 16px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 10px rgba(0, 0, 0, 0.06);
`;

export function BeginVerkoopClient() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const toast = useToast();
  const location = useResolvedLocationSlug();
  const shopHref = location ? `/${location}/shop` : "/";
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [storeName, setStoreName] = useState("");
  const [locations, setLocations] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [locationId, setLocationId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setHydrated(true);
    setSession(loadStoredSession());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [locRes, currentRes] = await Promise.all([
          fetch("/api/locations", { cache: "no-store" }),
          fetch("/api/location", { cache: "no-store" }),
        ]);

        const locBody: unknown = await locRes.json().catch(() => null);
        const currentBody: unknown = await currentRes.json().catch(() => null);

        const list =
          locBody &&
          typeof locBody === "object" &&
          "locations" in locBody &&
          Array.isArray((locBody as { locations?: unknown }).locations)
            ? ((locBody as { locations: unknown[] }).locations as unknown[])
            : [];

        const parsed = list.filter(
          (x): x is { id: string; name: string; slug: string } =>
            Boolean(x) &&
            typeof x === "object" &&
            typeof (x as { id?: unknown }).id === "string" &&
            typeof (x as { name?: unknown }).name === "string" &&
            typeof (x as { slug?: unknown }).slug === "string",
        );

        const currentId =
          currentBody &&
          typeof currentBody === "object" &&
          typeof (currentBody as { id?: unknown }).id === "string"
            ? (currentBody as { id: string }).id
            : "";

        if (!cancelled) {
          setLocations(parsed);
          setLocationId((prev) => prev || currentId || parsed[0]?.id || "");
        }
      } catch {
        // If locations fail to load, keep default behavior (current subdomain location).
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!hydrated || !session) {
    return (
      <>
        <Title>{t("beginSellingTitle")}</Title>
        <Subtitle>{t("signInFirstToCreateStore")}</Subtitle>
        <AccountOtpForm onSuccess={() => setSession(loadStoredSession())} />
        <BackLink href={shopHref}>{t("backToShopShort")}</BackLink>
      </>
    );
  }

  return (
    <>
      <Title>{t("beginSellingTitle")}</Title>
      <Subtitle>{t("chooseStoreNameSubtitle")}</Subtitle>

      <Card>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            const name = storeName.trim();
            if (!name) {
              setError(t("errEnterStoreName"));
              return;
            }
            setError(null);
            setCreating(true);
            try {
              const res = await fetch("/api/stores/my", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  phone: session.phone,
                  name,
                  ...(locationId ? { locationId } : {}),
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
                    : t("errCouldNotCreateStore");
                throw new Error(msg);
              }
              const storeId =
                data &&
                typeof data === "object" &&
                "storeId" in data &&
                typeof (data as { storeId: unknown }).storeId === "string"
                  ? (data as { storeId: string }).storeId
                  : null;
              if (!storeId) throw new Error(t("errInvalidServerResponse"));
              toast.success(
                language === "af" ? "Winkel geskep." : "Store created.",
              );
              router.push(`/account/stores/${encodeURIComponent(storeId)}`);
            } catch (err) {
              const msg = err instanceof Error ? err.message : t("errUnknown");
              setError(msg);
              toast.error(msg);
            } finally {
              setCreating(false);
            }
          }}
        >
          {error ? <ErrorMsg role="alert">{error}</ErrorMsg> : null}
          {locations.length > 0 ? (
            <Field>
              <Label htmlFor="new-store-location">Area / Location</Label>
              <Select
                id="new-store-location"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.slug})
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field>
            <Label htmlFor="new-store-only">{t("storeNameOnlyLabel")}</Label>
            <Input
              id="new-store-only"
              value={storeName}
              onChange={(e) => {
                setStoreName(e.target.value);
                setError(null);
              }}
              placeholder={t("storeNameOnlyPlaceholder")}
              required
            />
          </Field>
          <PrimaryBtn type="submit" disabled={creating}>
            {creating ? t("creating") : t("createStore")}
          </PrimaryBtn>
        </Form>
      </Card>

      <BackLink href="/account">Back to dashboard</BackLink>
    </>
  );
}
