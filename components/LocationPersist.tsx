"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { storeLocationSlug } from "@/lib/location-storage";

export function LocationPersist() {
  const params = useParams<{ location?: string }>();
  const slug = params?.location ? String(params.location).trim() : "";

  useEffect(() => {
    if (!slug) return;
    storeLocationSlug(slug);
  }, [slug]);

  return null;
}
