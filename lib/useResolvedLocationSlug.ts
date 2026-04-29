"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  loadStoredLocationSlug,
  storeLocationSlug,
} from "@/lib/location-storage";

export function useResolvedLocationSlug(): string | null {
  const params = useParams<{ location?: string }>();
  const fromRoute = params?.location ? String(params.location).trim() : "";

  const [storageTick, setStorageTick] = useState(0);

  useEffect(() => {
    // Keep in sync across tabs and after redirects.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "plaasmark-location-slug") {
        setStorageTick((n) => n + 1);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!fromRoute) return;
    storeLocationSlug(fromRoute);
  }, [fromRoute]);

  return useMemo(() => {
    if (fromRoute) return fromRoute;
    void storageTick;
    return loadStoredLocationSlug();
  }, [fromRoute, storageTick]);
}
