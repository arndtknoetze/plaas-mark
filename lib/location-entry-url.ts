/**
 * Builds the entry URL for a location using path-based routing.
 */
export function buildLocationEntryUrl(slug: string): string {
  return `/${encodeURIComponent(slug)}`;
}
