"use client";

const STORAGE_KEY = "plaasmark-location-slug";

export function loadStoredLocationSlug(): string | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  const slug = typeof v === "string" ? v.trim() : "";
  return slug ? slug : null;
}

export function storeLocationSlug(slug: string): void {
  if (typeof window === "undefined") return;
  const v = slug.trim();
  if (!v) return;
  window.localStorage.setItem(STORAGE_KEY, v);
}
