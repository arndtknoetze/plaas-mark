"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { MapLocation } from "@/components/MapView";

type Coordinates = { lat: number; lng: number };

type ApiNearbyLocation = {
  id: string;
  name: string;
  slug: string;
  province: string | null;
  lat: number | null;
  lng: number | null;
  bannerImageUrl: string | null;
  href: string;
  distanceKm?: number;
};

const MapView = dynamic(
  () => import("@/components/MapView").then((m) => m.MapView),
  { ssr: false },
);

const Wrap = styled.main`
  padding: 28px 0 70px;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 16px;
`;

const Title = styled.h1`
  margin: 0 0 6px;
  font-size: 1.6rem;
  font-weight: 950;
  letter-spacing: -0.04em;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Lead = styled.p`
  margin: 0 0 16px;
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.55;
`;

const MapCard = styled.div`
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 16px 38px rgba(0, 0, 0, 0.1);
  background: #fff;
`;

const MapFrame = styled.div`
  height: clamp(260px, 44vh, 520px);
  background: linear-gradient(135deg, #e7efe8, #f3f6f4);
`;

const List = styled.ul`
  list-style: none;
  padding: 12px;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Item = styled.a`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.9);
  color: ${({ theme }) => theme.colors.textDark};
  font-weight: 900;

  &:hover {
    border-color: rgba(46, 94, 62, 0.35);
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
  }
`;

const ItemMeta = styled.span`
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 800;
  font-size: 0.9rem;
  white-space: nowrap;
`;

export function LocationsMapClient() {
  const sp = useSearchParams();
  const nearLatRaw = sp.get("nearLat");
  const nearLngRaw = sp.get("nearLng");
  const nearLat = nearLatRaw ? Number(nearLatRaw) : null;
  const nearLng = nearLngRaw ? Number(nearLngRaw) : null;
  const hasNear =
    nearLat !== null &&
    nearLng !== null &&
    Number.isFinite(nearLat) &&
    Number.isFinite(nearLng);

  const [busy, setBusy] = useState(true);
  const [items, setItems] = useState<ApiNearbyLocation[]>([]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setBusy(true);
      try {
        const url = new URL("/api/locations", window.location.origin);
        if (hasNear) {
          url.searchParams.set("nearLat", String(nearLat));
          url.searchParams.set("nearLng", String(nearLng));
        }
        url.searchParams.set("limit", "24");
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = (await res.json()) as { locations?: ApiNearbyLocation[] };
        if (!alive) return;
        setItems(Array.isArray(data.locations) ? data.locations : []);
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (!alive) return;
        setBusy(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [hasNear, nearLat, nearLng]);

  const locations: MapLocation[] = useMemo(() => {
    return items
      .filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng))
      .map((l) => ({
        id: l.id,
        name: l.name,
        lat: Number(l.lat),
        lng: Number(l.lng),
        href: l.href,
      }));
  }, [items]);

  const userLocation: Coordinates | undefined = hasNear
    ? { lat: nearLat as number, lng: nearLng as number }
    : undefined;

  return (
    <Wrap>
      <Inner>
        <Title>PlaasMark map</Title>
        <Lead>
          {hasNear
            ? "Locations near you. Tap a town to start shopping."
            : "Tap a town to start shopping."}
        </Lead>

        <MapCard>
          <MapFrame>
            <MapView
              locations={locations}
              userLocation={userLocation}
              zoom={10}
            />
          </MapFrame>
          <List aria-busy={busy}>
            {items.map((i) => (
              <li key={i.href}>
                <Item href={i.href}>
                  <span>{i.name}</span>
                  <ItemMeta>
                    {typeof i.distanceKm === "number"
                      ? `${i.distanceKm.toFixed(1)} km`
                      : (i.province ?? "")}
                  </ItemMeta>
                </Item>
              </li>
            ))}
          </List>
        </MapCard>
      </Inner>
    </Wrap>
  );
}
