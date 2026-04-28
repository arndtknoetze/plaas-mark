import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LocationSelector } from "@/components/LocationSelector";
import { resolveLocationSlugFromHost } from "@/lib/host-subdomain";
import { buildLocationEntryUrl } from "@/lib/location-entry-url";

const AREA_CHOICES: { slug: string; label: string }[] = [
  { slug: "malmesbury", label: "Malmesbury" },
  { slug: "paarl", label: "Paarl" },
  { slug: "stellenbosch", label: "Stellenbosch" },
];

export const metadata: Metadata = {
  title: "Welkom",
  description: "PlaasMark — plaasvars produkte van plaaslike verkopers.",
};

export default async function HomePage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");

  if (resolveLocationSlugFromHost(host) !== null) {
    redirect("/shop");
  }

  const locations = AREA_CHOICES.map(({ slug, label }) => ({
    label,
    href: buildLocationEntryUrl(slug, h),
  }));

  return <LocationSelector headingKey="selectLocation" locations={locations} />;
}
