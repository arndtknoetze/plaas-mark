import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { LandingLocationPrompt } from "@/components/LandingLocationPrompt";
import { LocationSelector } from "@/components/LocationSelector";
import { resolveLocationSlugFromHost } from "@/lib/host-subdomain";
import { buildLocationEntryUrl } from "@/lib/location-entry-url";

const LOCATIONS_PER_PAGE = 24;

export const metadata: Metadata = {
  title: "Welkom",
  description: "PlaasMark — plaasvars produkte van plaaslike verkopers.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const sp = (await searchParams) ?? {};
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const pageNum = Number(pageRaw);
  const page =
    Number.isFinite(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1;

  if (resolveLocationSlugFromHost(host) !== null) {
    redirect("/shop");
  }

  const total = await prisma.location.count();
  const totalPages = Math.max(1, Math.ceil(total / LOCATIONS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * LOCATIONS_PER_PAGE;
  const pageRows = await prisma.location.findMany({
    orderBy: { name: "asc" },
    skip,
    take: LOCATIONS_PER_PAGE,
    select: {
      slug: true,
      name: true,
      province: true,
    },
  });

  const locations = pageRows.map((row) => ({
    slug: row.slug,
    label: row.name,
    href: buildLocationEntryUrl(row.slug, h),
    province: row.province,
  }));

  return (
    <>
      <LandingLocationPrompt />
      <LocationSelector
        headingKey="welcomeTitle"
        leadKey="selectLocationLead"
        locations={locations}
        pagination={{
          page: safePage,
          totalPages,
          totalItems: total,
          perPage: LOCATIONS_PER_PAGE,
          basePath: "/",
        }}
      />
    </>
  );
}
