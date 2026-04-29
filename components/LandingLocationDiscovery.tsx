"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import styled from "styled-components";
import { LocateFixed, MapPinned } from "lucide-react";
import { useLanguage } from "@/lib/useLanguage";
import { TownBanner } from "@/components/TownBanner";
import dynamic from "next/dynamic";
import type { MapLocation } from "@/components/MapView";
import { storeLocationSlug } from "@/lib/location-storage";

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
const STORAGE_EVENT = "plaasmark-landing-nearby-update";

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

  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: minmax(0, 1fr) 260px;
    align-items: start;
  }
`;

const HeroLeft = styled.div`
  min-width: 0;
`;

const WeatherCard = styled.aside`
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.85);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.03),
    0 10px 24px rgba(0, 0, 0, 0.06);
  padding: 12px;
  display: grid;
  gap: 8px;

  @media (min-width: 768px) {
    margin-top: 2px;
  }
`;

const WeatherTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const WeatherTitle = styled.div`
  font-weight: 950;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textDark};
`;

const WeatherMeta = styled.div`
  font-size: 0.85rem;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.textLight};
`;

const WeatherRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const WeatherTemp = styled.div`
  font-size: 1.55rem;
  font-weight: 980;
  letter-spacing: -0.04em;
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1;
`;

const WeatherRange = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  font-size: 0.85rem;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.textLight};
`;

function formatC(tempC: number): string {
  return `${Math.round(tempC)}°C`;
}

function weatherLabelFromCode(code: number): string {
  // Open-Meteo weather codes: https://open-meteo.com/en/docs
  if (code === 0) return "Clear";
  if (code === 1 || code === 2) return "Mostly clear";
  if (code === 3) return "Cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code === 51 || code === 53 || code === 55) return "Drizzle";
  if (code === 56 || code === 57) return "Freezing drizzle";
  if (code === 61 || code === 63 || code === 65) return "Rain";
  if (code === 66 || code === 67) return "Freezing rain";
  if (code === 71 || code === 73 || code === 75) return "Snow";
  if (code === 77) return "Snow grains";
  if (code === 80 || code === 81 || code === 82) return "Showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code === 95 || code === 96 || code === 99) return "Thunderstorm";
  return "Weather";
}

function WeatherIcon({ code }: { code: number }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
  } as const;

  if (code === 0) {
    return (
      <svg {...common}>
        <path
          d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 2v2M12 20v2M4 12H2M22 12h-2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M19.4 4.6 18 6M6 18l-1.4 1.4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if ([61, 63, 65, 80, 81, 82, 95, 96, 99, 51, 53, 55, 56, 57].includes(code)) {
    return (
      <svg {...common}>
        <path
          d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.3 2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 20l-1 2M12 20l-1 2M15 20l-1 2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 20h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

let cachedStoredRaw: string | null | undefined;
let cachedStoredParsed:
  | { coords: Coordinates; locations: ApiNearbyLocation[] }
  | null
  | undefined;

function getStoredSnapshotCached(): {
  coords: Coordinates;
  locations: ApiNearbyLocation[];
} | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === cachedStoredRaw) return cachedStoredParsed ?? null;
  cachedStoredRaw = raw;
  cachedStoredParsed = readStored();
  return cachedStoredParsed ?? null;
}

function writeStored(input: {
  coords: Coordinates;
  locations: ApiNearbyLocation[];
}) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    cachedStoredRaw = sessionStorage.getItem(STORAGE_KEY);
    cachedStoredParsed = input;
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    /* ignore */
  }
}

function onLocationChosen(slug: string) {
  storeLocationSlug(slug);
}

export function LandingLocationDiscovery() {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  // Prevent hydration mismatch: server snapshot is always null.
  const stored = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(STORAGE_EVENT, onStoreChange);
      return () => window.removeEventListener(STORAGE_EVENT, onStoreChange);
    },
    () => getStoredSnapshotCached(),
    () => null,
  );

  // Live results from "Use my location" button.
  const [liveCoords, setLiveCoords] = useState<Coordinates | null>(null);
  const [liveNearby, setLiveNearby] = useState<ApiNearbyLocation[] | null>(
    null,
  );

  const coords = liveCoords ?? stored?.coords ?? null;
  const nearby = liveNearby ?? stored?.locations ?? null;
  const [preview, setPreview] = useState<ApiPreviewLocation[] | null>(null);
  const [weather, setWeather] = useState<{
    tempC: number;
    code: number;
    minC: number | null;
    maxC: number | null;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // NOTE: storage hydration happens via `useSyncExternalStore`.

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
          setLiveCoords(user);
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
            setLiveNearby(list);
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

  useEffect(() => {
    if (!coords) return;

    const controller = new AbortController();
    /* eslint-disable react-hooks/set-state-in-effect -- async fetch state machine */
    setWeatherLoading(true);

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(coords.lat));
    url.searchParams.set("longitude", String(coords.lng));
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("current", "temperature_2m,weather_code");
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");

    fetch(url.toString(), { signal: controller.signal })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (!data || typeof data !== "object") return;

        const current = (data as { current?: unknown }).current as
          | { temperature_2m?: unknown; weather_code?: unknown }
          | undefined;
        const daily = (data as { daily?: unknown }).daily as
          | {
              temperature_2m_max?: unknown;
              temperature_2m_min?: unknown;
            }
          | undefined;

        const tempC =
          current && typeof current.temperature_2m === "number"
            ? current.temperature_2m
            : null;
        const code =
          current && typeof current.weather_code === "number"
            ? current.weather_code
            : null;

        const maxArr = Array.isArray(daily?.temperature_2m_max)
          ? (daily?.temperature_2m_max as unknown[])
          : [];
        const minArr = Array.isArray(daily?.temperature_2m_min)
          ? (daily?.temperature_2m_min as unknown[])
          : [];

        const maxC =
          typeof maxArr[0] === "number" ? (maxArr[0] as number) : null;
        const minC =
          typeof minArr[0] === "number" ? (minArr[0] as number) : null;

        if (tempC === null || code === null) return;
        setWeather({ tempC, code, minC, maxC });
      })
      .catch(() => {})
      .finally(() => setWeatherLoading(false));
    /* eslint-enable react-hooks/set-state-in-effect */

    return () => controller.abort();
  }, [coords]);

  const mapHref =
    coords && points.length > 0
      ? `/locations/map?nearLat=${encodeURIComponent(coords.lat)}&nearLng=${encodeURIComponent(coords.lng)}`
      : "/locations/map";

  return (
    <Wrap>
      <Inner>
        <HeroCard>
          <HeroLeft>
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
          </HeroLeft>

          {coords ? (
            <WeatherCard aria-label="Today's weather">
              <WeatherTop>
                <WeatherTitle>Today</WeatherTitle>
                <WeatherMeta>
                  {weatherLoading ? "Loading…" : "Weather"}
                </WeatherMeta>
              </WeatherTop>

              {weather ? (
                <WeatherRow>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <WeatherIcon code={weather.code} />
                    <div style={{ display: "grid" }}>
                      <WeatherTemp>{formatC(weather.tempC)}</WeatherTemp>
                      <WeatherMeta>
                        {weatherLabelFromCode(weather.code)}
                      </WeatherMeta>
                    </div>
                  </div>
                  <WeatherRange>
                    <div>
                      High:{" "}
                      {typeof weather.maxC === "number"
                        ? formatC(weather.maxC)
                        : "—"}
                    </div>
                    <div>
                      Low:{" "}
                      {typeof weather.minC === "number"
                        ? formatC(weather.minC)
                        : "—"}
                    </div>
                  </WeatherRange>
                </WeatherRow>
              ) : (
                <WeatherMeta>Share location to see weather.</WeatherMeta>
              )}
            </WeatherCard>
          ) : null}
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
                  onClick={() => onLocationChosen(location.slug)}
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
