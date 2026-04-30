/** Production origin for sitemaps, robots, and absolute Open Graph URLs. */
export const SITE_ORIGIN = "https://plaas-mark.co.za";

export const defaultSiteTitle = "PlaasMark | Koop plaas vars produkte naby jou";

export const defaultSiteDescription =
  "Aanlyn plaas mark waar jy direk van plaaslike verkopers kan koop. Vars produkte, geen middleman.";

export const indexableRobots = { index: true, follow: true } as const;

export function sitePath(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN.replace(/\/+$/, "")}${p}`;
}
