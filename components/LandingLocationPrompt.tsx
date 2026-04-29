"use client";

import { useState } from "react";
import styled from "styled-components";
import { useLanguage } from "@/lib/useLanguage";

type ApiLocation = {
  id: string;
  name: string;
  slug: string;
  province: string | null;
  lat: number | null;
  lng: number | null;
  bannerImageUrl: string | null;
  href: string;
};

type Coordinates = {
  lat: number;
  lng: number;
};

const MAX_MATCH_DISTANCE_KM = 50;

const Wrap = styled.div`
  margin: 0 auto 18px;
  max-width: 1040px;
  padding: 0 16px;
`;

const Card = styled.div`
  border: 1px solid rgba(46, 94, 62, 0.2);
  background: rgba(46, 94, 62, 0.06);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
  align-items: center;
  justify-content: space-between;
`;

const Text = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textDark};
  font-size: 0.95rem;
`;

const Button = styled.button`
  border: 0;
  border-radius: 10px;
  min-height: 40px;
  padding: 0 14px;
  font-weight: 900;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
`;

const Hint = styled.p`
  margin: 7px 0 0;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

function distanceKm(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function LandingLocationPrompt() {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const onUseLocation = async () => {
    if (busy) return;
    if (!("geolocation" in navigator)) {
      setHint(t("locationUnavailableHint"));
      return;
    }

    setBusy(true);
    setHint(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const user: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        try {
          const res = await fetch("/api/locations", {
            method: "GET",
            cache: "no-store",
          });
          if (!res.ok) {
            throw new Error("Failed to load locations");
          }
          const data = (await res.json()) as { locations?: ApiLocation[] };
          const all = Array.isArray(data.locations) ? data.locations : [];
          const nearby = all
            .filter(
              (location) =>
                Number.isFinite(location.lat) && Number.isFinite(location.lng),
            )
            .map((location) => ({
              ...location,
              distanceKm: distanceKm(user, {
                lat: Number(location.lat),
                lng: Number(location.lng),
              }),
            }))
            .filter((location) => location.distanceKm <= MAX_MATCH_DISTANCE_KM)
            .sort((a, b) => a.distanceKm - b.distanceKm);

          const best = nearby[0] ?? null;
          if (!best) {
            setBusy(false);
            setHint(t("locationNoMatchHint"));
            return;
          }

          window.location.assign(best.href);
        } catch {
          setBusy(false);
          setHint(t("locationLoadFailedHint"));
        }
      },
      () => {
        setBusy(false);
        setHint(t("locationPermissionDeniedHint"));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  };

  return (
    <Wrap>
      <Card>
        <Text>{t("locationPromptLead")}</Text>
        <Button type="button" onClick={onUseLocation} disabled={busy}>
          {busy ? t("locationCheckingCta") : t("locationShareCta")}
        </Button>
      </Card>
      {hint ? <Hint>{hint}</Hint> : null}
    </Wrap>
  );
}
