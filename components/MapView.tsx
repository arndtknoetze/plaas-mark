"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import styled from "styled-components";

import "leaflet/dist/leaflet.css";

// Leaflet default marker assets (fix for bundlers/Next)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type LatLng = { lat: number; lng: number };

export type MapLocation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  href?: string;
};

export type MapViewProps = {
  locations: MapLocation[];
  userLocation?: LatLng;
  zoom?: number;
  interactive?: boolean;
  showPopups?: boolean;
};

const DEFAULT_CENTER: LatLng = { lat: -30.5595, lng: 22.9375 }; // South Africa
const DEFAULT_ZOOM = 6;

const Wrap = styled.div`
  height: 100%;
  width: 100%;

  .leaflet-container {
    height: 100%;
    width: 100%;
    border-radius: 18px;
    touch-action: pan-x pan-y;
  }
`;

function setLeafletDefaultIconOnce() {
  // Avoid repeated merges during HMR.
  const w = window as unknown as { __plaasmark_leaflet_icon_set?: boolean };
  if (w.__plaasmark_leaflet_icon_set) return;
  w.__plaasmark_leaflet_icon_set = true;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src,
    iconUrl: markerIcon.src,
    shadowUrl: markerShadow.src,
  });
}

function FitBounds({
  points,
  userLocation,
  fallbackCenter,
  fallbackZoom,
}: {
  points: LatLng[];
  userLocation?: LatLng;
  fallbackCenter: LatLng;
  fallbackZoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      map.setView(
        userLocation
          ? [userLocation.lat, userLocation.lng]
          : [fallbackCenter.lat, fallbackCenter.lng],
        userLocation ? 10 : fallbackZoom,
        { animate: true },
      );
      return;
    }

    const all = userLocation ? [userLocation, ...points] : points;
    const bounds = L.latLngBounds(
      all.map((p) => [p.lat, p.lng] as [number, number]),
    );
    map.fitBounds(bounds, {
      padding: [18, 18],
      maxZoom: 12,
      animate: true,
    });
  }, [map, points, userLocation, fallbackCenter, fallbackZoom]);

  return null;
}

export function MapView({
  locations,
  userLocation,
  zoom,
  interactive = true,
  showPopups = true,
}: MapViewProps) {
  useEffect(() => {
    setLeafletDefaultIconOnce();
  }, []);

  const locationIcon = useMemo(() => {
    // Custom marker stored in /public
    return L.icon({
      iconUrl: "/map-pin.png",
      iconSize: [32, 48],
      iconAnchor: [16, 46],
      popupAnchor: [0, -42],
    });
  }, []);

  const points = useMemo(
    () =>
      locations
        .filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng))
        .map((l) => ({ lat: l.lat, lng: l.lng })),
    [locations],
  );

  const initialCenter = userLocation ?? DEFAULT_CENTER;
  const initialZoom = zoom ?? (userLocation ? 10 : DEFAULT_ZOOM);

  return (
    <Wrap>
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={initialZoom}
        scrollWheelZoom={interactive}
        preferCanvas
        zoomControl={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        keyboard={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds
          points={points}
          userLocation={userLocation}
          fallbackCenter={DEFAULT_CENTER}
          fallbackZoom={DEFAULT_ZOOM}
        />

        {userLocation ? (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={8}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#3b82f6",
              fillOpacity: 0.35,
              weight: 2,
            }}
          >
            {showPopups ? (
              <Popup>
                <strong>Your location</strong>
              </Popup>
            ) : null}
          </CircleMarker>
        ) : null}

        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={locationIcon}
          >
            {showPopups ? (
              <Popup>
                <div style={{ display: "grid", gap: 8 }}>
                  <strong>{loc.name}</strong>
                  {loc.href ? (
                    <Link
                      href={loc.href}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 36,
                        padding: "0 12px",
                        borderRadius: 10,
                        background: "rgba(46, 94, 62, 0.12)",
                        border: "1px solid rgba(46, 94, 62, 0.22)",
                        color: "rgba(15, 23, 42, 0.95)",
                        fontWeight: 900,
                        textDecoration: "none",
                      }}
                    >
                      Go to location
                    </Link>
                  ) : null}
                </div>
              </Popup>
            ) : null}
          </Marker>
        ))}
      </MapContainer>
    </Wrap>
  );
}
