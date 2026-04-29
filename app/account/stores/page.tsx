"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { AccountOtpForm } from "@/components/AccountOtpForm";
import {
  Card,
  CardTitle,
  DashboardPage,
  FullBleed,
  Muted,
  PageHeader,
  PageSubtitle,
  PageTitle,
  PrimaryLink,
  SecondaryLink,
  StorePrimaryLink,
  ActionsRow,
} from "@/components/account/ui";
import { useLanguage } from "@/lib/useLanguage";
import { loadStoredSession, type StoredSession } from "@/lib/session-storage";
import { useResolvedLocationSlug } from "@/lib/useResolvedLocationSlug";

type StoreCardRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  brandColor: string;
  logoUrl: string | null;
  productsCount: number;
  ordersCount: number;
};

type StoresOverviewResponse = { stores: StoreCardRow[] };

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1060px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StoreCard = styled.article`
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #e5e5e5;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.07);
  }
`;

const StoreTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const Logo = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  object-fit: cover;
  flex-shrink: 0;
`;

const FallbackLogo = styled.div<{ $color: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: ${({ $color }) => $color};
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.03);
  flex-shrink: 0;
`;

const StoreName = styled.div`
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textDark};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StoreMeta = styled.div`
  margin-top: 6px;
  font-size: 0.85rem;
  color: #777;
`;

const MiniKpis = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const MiniKpi = styled.div`
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #eee;
  background: #ffffff;
`;

const MiniLabel = styled.div`
  font-size: 0.8rem;
  color: #777;
  font-weight: 600;
`;

const MiniValue = styled.div`
  margin-top: 6px;
  font-size: 1.25rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textDark};
`;

const CardActions = styled(ActionsRow)`
  justify-content: flex-start;
`;

function isStoresOverviewResponse(
  value: unknown,
): value is StoresOverviewResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as { stores?: unknown };
  return Array.isArray(v.stores);
}

function storePublicUrl(
  s: Pick<StoreCardRow, "slug" | "id">,
  locationSlug: string | null,
) {
  return locationSlug ? `/${locationSlug}/store/${s.slug}--${s.id}` : "/";
}

export default function AccountStoresPage() {
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
  const [stores, setStores] = useState<StoreCardRow[] | null>(null);

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
      setLoading(true);
      try {
        const res = await fetch(
          `/api/account/stores-overview?phone=${encodeURIComponent(session.phone)}${locationQuery}`,
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
              : t("errUnknown");
          throw new Error(msg);
        }
        if (!isStoresOverviewResponse(data))
          throw new Error(t("errInvalidServerResponse"));
        if (!cancelled) setStores((data as StoresOverviewResponse).stores);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("errUnknown"));
          setStores(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootstrapped, locationQuery, session, t]);

  if (!bootstrapped || !session) {
    return (
      <FullBleed>
        <DashboardPage>
          <PageHeader>
            <PageTitle>Stores</PageTitle>
            <PageSubtitle>Sign in to manage your stores.</PageSubtitle>
          </PageHeader>
          <Card>
            <CardTitle>{t("signInTitle")}</CardTitle>
            <Muted style={{ marginBottom: 12 }}>
              {t("accountStoredOnDevice")}
            </Muted>
            <AccountOtpForm onSuccess={() => setSession(loadStoredSession())} />
          </Card>
        </DashboardPage>
      </FullBleed>
    );
  }

  return (
    <FullBleed>
      <DashboardPage>
        <PageHeader>
          <PageTitle>Stores</PageTitle>
          <PageSubtitle>Manage your stores in one place.</PageSubtitle>
        </PageHeader>

        <Card>
          <CardTitle>Quick actions</CardTitle>
          <ActionsRow>
            <PrimaryLink href="/begin-verkoop">
              {t("createNewStore")}
            </PrimaryLink>
            <SecondaryLink href="/account">Back to dashboard</SecondaryLink>
          </ActionsRow>
        </Card>

        {loading ? <Muted>{t("loading")}</Muted> : null}
        {error ? <Muted role="alert">{error}</Muted> : null}

        {!loading && !error && stores && stores.length === 0 ? (
          <Card>
            <CardTitle>No stores yet</CardTitle>
            <Muted>Create your first store to start selling.</Muted>
            <ActionsRow>
              <PrimaryLink href="/begin-verkoop">
                {t("startSellingCta")}
              </PrimaryLink>
            </ActionsRow>
          </Card>
        ) : null}

        {!loading && !error && stores && stores.length > 0 ? (
          <Grid>
            {stores.map((s) => (
              <StoreCard key={s.id}>
                <StoreTop>
                  {s.logoUrl ? (
                    <Logo src={s.logoUrl} alt={`${s.name} logo`} />
                  ) : (
                    <FallbackLogo
                      $color={s.brandColor || "#2E5E3E"}
                      aria-hidden
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <StoreName>{s.name}</StoreName>
                    <StoreMeta>
                      {s.isActive ? "Active" : "Inactive"} •{" "}
                      {storePublicUrl(s, location)}
                    </StoreMeta>
                  </div>
                </StoreTop>

                <MiniKpis>
                  <MiniKpi>
                    <MiniLabel>Products</MiniLabel>
                    <MiniValue>{s.productsCount}</MiniValue>
                  </MiniKpi>
                  <MiniKpi>
                    <MiniLabel>Orders</MiniLabel>
                    <MiniValue>{s.ordersCount}</MiniValue>
                  </MiniKpi>
                </MiniKpis>

                <CardActions>
                  <StorePrimaryLink
                    href={`/account/stores/${encodeURIComponent(s.id)}`}
                    $color={s.brandColor || "#2E5E3E"}
                  >
                    Manage
                  </StorePrimaryLink>
                  <SecondaryLink href={storePublicUrl(s, location)}>
                    View
                  </SecondaryLink>
                </CardActions>
              </StoreCard>
            ))}
          </Grid>
        ) : null}
      </DashboardPage>
    </FullBleed>
  );
}
