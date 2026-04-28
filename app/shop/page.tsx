import type { Metadata } from "next";
import { getPublicLocationOrNull } from "@/lib/location";
import ShopPageClient from "@/app/shop/ShopPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const location = await getPublicLocationOrNull();
  const locName = location?.name ?? "jou area";

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

export default function ShopPage() {
  return <ShopPageClient />;
}
