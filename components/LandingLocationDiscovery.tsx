"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { LocateFixed, MapPinned } from "lucide-react";
import { useLanguage } from "@/lib/useLanguage";
import { TownBanner } from "@/components/TownBanner";
import dynamic from "next/dynamic";
import type { MapLocation } from "@/components/MapView";

type ApiNearbyLocation = {
  id: string;
  name: string;
  slug: string;
  province: string | null;
  lat: number | null;
  lng: number | null;
  bannerImageUrl: string | null;
  href: string;
  distanceKm: number;
};

type ApiPreviewLocation = Omit<ApiNearbyLocation, "distanceKm">;

type Coordinates = {
  lat: number;
  lng: number;
};

const STORAGE_KEY = "plaasmark-landing-nearby-v1";

const Wrap = styled.section`
  padding: 32px 0 24px;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const HeroCard = styled.div`
  border-radius: 18px;
  padding: 18px;
  border: 1px solid rgba(46, 94, 62, 0.18);
  background:
    radial-gradient(
      1200px 420px at 50% 0%,
      rgba(46, 94, 62, 0.12),
      transparent 60%
    ),
    #fff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 14px 34px rgba(0, 0, 0, 0.08);
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 950;
  letter-spacing: -0.04em;
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.1;

  @media (min-width: 768px) {
    font-size: 2.4rem;
  }
`;

const HeroLead = styled.p`
  margin: 10px 0 0;
  font-size: 1.02rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};
  max-width: 64ch;
`;

const HeroActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;

  @media (min-width: 560px) {
    flex-direction: row;
    align-items: center;
  }
`;

const PrimaryButton = styled.button`
  border: 0;
  border-radius: 12px;
  min-height: 44px;
  padding: 0 16px;
  font-weight: 950;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 10px 22px rgba(46, 94, 62, 0.22);

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    box-shadow: none;
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
  }
`;

const Hint = styled.p`
  margin: 10px 0 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Section = styled.section``;

const SectionHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 950;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textDark};
`;

const SectionLead = styled.p`
  margin: 6px 0 0;
  font-size: 0.92rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const NearbyGrid = styled.ul`
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
`;

const CardLink = styled.a`
  display: block;
  border-radius: 18px;
  overflow: hidden;
  text-decoration: none;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 12px 26px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.14s ease,
    box-shadow 0.14s ease,
    border-color 0.14s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(46, 94, 62, 0.35);
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.04),
      0 16px 36px rgba(0, 0, 0, 0.12);
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
  }
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px 12px;
`;

const CardSub = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CardTown = styled.div`
  font-weight: 950;
  color: ${({ theme }) => theme.colors.textDark};
  letter-spacing: -0.01em;
`;

const CardDistance = styled.div`
  font-weight: 800;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(46, 94, 62, 0.1);
  border: 1px solid rgba(46, 94, 62, 0.18);
  color: ${({ theme }) => theme.colors.textDark};
  font-weight: 900;
  font-size: 0.85rem;
  white-space: nowrap;
`;

const MapPreviewLink = styled.a`
  display: block;
  border-radius: 18px;
  overflow: hidden;
  text-decoration: none;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 12px 26px rgba(0, 0, 0, 0.08);

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
  }
`;

const MapPreviewFrame = styled.div`
  height: 240px;
  position: relative;
  background: linear-gradient(135deg, #e7efe8, #f3f6f4);
`;

const MapCanvas = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const ClickOverlay = styled.span`
  position: absolute;
  inset: 0;
`;

const MapFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
`;

const MapFooterText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MapFooterTitle = styled.div`
  font-weight: 950;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.textDark};
`;

const MapFooterHint = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const MapView = dynamic(
  () => import("@/components/MapView").then((m) => m.MapView),
  { ssr: false },
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readStored(): {
  coords: Coordinates;
  locations: ApiNearbyLocation[];
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;
    const coords = parsed.coords;
    const locations = parsed.locations;
    if (
      !isRecord(coords) ||
      typeof coords.lat !== "number" ||
      typeof coords.lng !== "number" ||
      !Array.isArray(locations) ||
      !locations.every((l) => isRecord(l))
    ) {
      return null;
    }

    return {
      coords: { lat: coords.lat, lng: coords.lng },
      locations: locations as ApiNearbyLocation[],
    };
  } catch {
    return null;
  }
}

function writeStored(input: {
  coords: Coordinates;
  locations: ApiNearbyLocation[];
}) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(input));
  } catch {
    /* ignore */
  }
}

export function LandingLocationDiscovery() {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(
    () => readStored()?.coords ?? null,
  );
  const [nearby, setNearby] = useState<ApiNearbyLocation[] | null>(
    () => readStored()?.locations ?? null,
  );
  const [preview, setPreview] = useState<ApiPreviewLocation[] | null>(null);

  const points = useMemo(() => {
    const source =
      nearby && nearby.length > 0
        ? nearby
        : preview && preview.length > 0
          ? preview
          : [];
    return source
      .filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng))
      .map((l) => ({ lat: Number(l.lat), lng: Number(l.lng) }));
  }, [nearby, preview]);

  const mapLocations: MapLocation[] = useMemo(() => {
    const source =
      nearby && nearby.length > 0
        ? nearby
        : preview && preview.length > 0
          ? preview
          : [];
    return source
      .filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng))
      .slice(0, 12)
      .map((l) => ({
        id: l.id,
        name: l.name,
        lat: Number(l.lat),
        lng: Number(l.lng),
        href: l.href,
      }));
  }, [nearby, preview]);

  useEffect(() => {
    if (preview || (nearby && nearby.length > 0)) return;
    let alive = true;
    const run = async () => {
      try {
        const url = new URL("/api/locations", window.location.origin);
        url.searchParams.set("limit", "9");
        const res = await fetch(url.toString(), { cache: "force-cache" });
        if (!res.ok) return;
        const data = (await res.json()) as { locations?: ApiPreviewLocation[] };
        if (!alive) return;
        const list = Array.isArray(data.locations) ? data.locations : [];
        setPreview(list);
      } catch {
        /* ignore */
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [preview, nearby]);

  const onUseLocation = useCallback(
    async ({ silent }: { silent?: boolean } = {}) => {
      if (busy) return;
      if (!("geolocation" in navigator)) {
        if (!silent) setHint(t("locationUnavailableHint"));
        return;
      }

      setBusy(true);
      if (!silent) setHint(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const user: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(user);
          try {
            const url = new URL("/api/locations", window.location.origin);
            url.searchParams.set("nearLat", String(user.lat));
            url.searchParams.set("nearLng", String(user.lng));
            url.searchParams.set("limit", "9");
            const res = await fetch(url.toString(), {
              method: "GET",
              cache: "no-store",
            });
            if (!res.ok) throw new Error("Failed to load locations");
            const data = (await res.json()) as {
              locations?: ApiNearbyLocation[];
            };
            const list = Array.isArray(data.locations) ? data.locations : [];
            setNearby(list);
            writeStored({ coords: user, locations: list });
            setBusy(false);
          } catch {
            setBusy(false);
            if (!silent) setHint(t("locationLoadFailedHint"));
          }
        },
        () => {
          setBusy(false);
          if (!silent) setHint(t("locationPermissionDeniedHint"));
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000,
        },
      );
    },
    [busy, t],
  );

  useEffect(() => {
    if (coords || (nearby && nearby.length > 0) || busy) return;
    if (!("geolocation" in navigator)) return;

    let alive = true;
    const run = async () => {
      try {
        if (!("permissions" in navigator)) return;
        const status = await (
          navigator as Navigator & {
            permissions: {
              query: (desc: { name: string }) => Promise<{ state: string }>;
            };
          }
        ).permissions.query({ name: "geolocation" });
        if (!alive) return;
        if (status.state === "granted") {
          await onUseLocation({ silent: true });
        }
      } catch {
        /* ignore */
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [coords, nearby, busy, onUseLocation]);

  const mapHref =
    coords && points.length > 0
      ? `/locations/map?nearLat=${encodeURIComponent(coords.lat)}&nearLng=${encodeURIComponent(coords.lng)}`
      : "/locations/map";

  return (
    <Wrap>
      <Inner>
        <HeroCard>
          <HeroTitle>{t("welcomeTitle")}</HeroTitle>
          <HeroLead>{t("welcomeDescription")}</HeroLead>
          <HeroActions>
            <PrimaryButton
              type="button"
              onClick={() => onUseLocation({ silent: false })}
              disabled={busy}
            >
              <LocateFixed size={18} aria-hidden="true" />
              {busy ? t("locationCheckingCta") : t("locationShareCta")}
            </PrimaryButton>
          </HeroActions>
          {hint ? <Hint>{hint}</Hint> : null}
        </HeroCard>

        <Section aria-labelledby="nearby-heading">
          <SectionHead>
            <div>
              <SectionTitle id="nearby-heading">
                {t("nearbyLocationsTitle")}
              </SectionTitle>
              <SectionLead>{t("nearbyLocationsLead")}</SectionLead>
            </div>
          </SectionHead>

          <NearbyGrid>
            {(nearby ?? []).slice(0, 9).map((location) => (
              <li key={location.href}>
                <CardLink
                  href={location.href}
                  aria-label={`${location.name} — ${t("startShopping")}`}
                >
                  <TownBanner
                    town={location.name}
                    province={location.province}
                    slug={location.slug}
                  />
                  <CardMeta>
                    <CardSub>
                      <CardTown>{location.name}</CardTown>
                      <CardDistance>
                        {location.distanceKm.toFixed(1)} km
                      </CardDistance>
                    </CardSub>
                    <Chip>{t("nearbyCta")}</Chip>
                  </CardMeta>
                </CardLink>
              </li>
            ))}
            {!nearby || nearby.length === 0 ? (
              <li>
                <Hint>{t("nearbyLocationsEmptyHint")}</Hint>
              </li>
            ) : null}
          </NearbyGrid>
        </Section>

        <Section aria-labelledby="map-preview-heading">
          <SectionHead>
            <div>
              <SectionTitle id="map-preview-heading">
                {t("mapPreviewTitle")}
              </SectionTitle>
              <SectionLead>{t("mapPreviewLead")}</SectionLead>
            </div>
          </SectionHead>

          <MapPreviewLink href={mapHref} aria-label={t("openMapCta")}>
            <MapPreviewFrame>
              <MapCanvas>
                <MapView
                  locations={mapLocations}
                  userLocation={coords ?? undefined}
                  zoom={10}
                  interactive={false}
                  showPopups={false}
                />
              </MapCanvas>
              <ClickOverlay aria-hidden="true" />
            </MapPreviewFrame>
            <MapFooter>
              <MapFooterText>
                <MapFooterTitle>{t("openMapCta")}</MapFooterTitle>
                <MapFooterHint>{t("mapPreviewHint")}</MapFooterHint>
              </MapFooterText>
              <Chip>
                <MapPinned size={16} aria-hidden="true" /> {t("mapPreviewChip")}
              </Chip>
            </MapFooter>
          </MapPreviewLink>
        </Section>
      </Inner>
    </Wrap>
  );
}
