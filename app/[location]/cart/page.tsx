import type { Metadata } from "next";
import CartPageClient from "@/components/CartPageClient";
import { indexableRobots, sitePath } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location: slug } = await params;
  const path = `/${slug}/cart`;

  return {
    robots: indexableRobots,
    alternates: { canonical: path },
    openGraph: {
      url: sitePath(path),
      siteName: "PlaasMark",
      type: "website",
    },
  };
}

export default async function LocationCartPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location } = await params;
  return <CartPageClient locationSlug={location} />;
}
