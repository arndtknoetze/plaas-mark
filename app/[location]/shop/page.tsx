import type { Metadata } from "next";
import { getLocationBySlug } from "@/lib/location";
import ShopPageClient from "@/app/shop/ShopPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location: slug } = await params;

  const location = await getLocationBySlug(slug).catch(() => null);
  const locName = location?.name ?? slug;

  const title = `Winkel – PlaasMark ${locName}`;
  const description = `Blaai produkte van plaaslike verkopers in ${locName}. Vars, tuisgemaakte en plaasprodukte beskikbaar vir bestelling.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "PlaasMark",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function LocationShopPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location } = await params;
  return <ShopPageClient locationSlug={location} />;
}
