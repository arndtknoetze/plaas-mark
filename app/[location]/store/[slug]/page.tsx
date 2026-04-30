import type { Metadata } from "next";
import StorePageClient from "@/components/StorePageClient";
import { prisma } from "@/lib/db";
import { indexableRobots, sitePath } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string; slug: string }>;
}): Promise<Metadata> {
  const { location: locationSlug, slug: slugParam } = await params;
  const path = `/${locationSlug}/store/${slugParam}`;
  const storeId = slugParam.includes("--")
    ? (slugParam.split("--").pop() ?? "")
    : "";

  if (!storeId) {
    return { robots: indexableRobots, alternates: { canonical: path } };
  }

  let store: { name: string } | null = null;
  let locationLabel = locationSlug;
  try {
    const [storeRow, locRow] = await Promise.all([
      prisma.store.findFirst({
        where: {
          id: storeId,
          isActive: true,
          location: { slug: locationSlug },
        },
        select: { name: true },
      }),
      prisma.location.findUnique({
        where: { slug: locationSlug },
        select: { name: true },
      }),
    ]);
    store = storeRow;
    locationLabel = locRow?.name ?? locationSlug;
  } catch {
    store = null;
  }

  const title = store
    ? `${store.name} | PlaasMark ${locationLabel}`
    : `Winkel | PlaasMark`;
  const description = store
    ? `Koop vars produkte by ${store.name}. Plaaslike verkoper op PlaasMark in ${locationLabel}.`
    : `Blaai hierdie winkel op PlaasMark.`;

  return {
    title,
    description,
    robots: indexableRobots,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: sitePath(path),
      siteName: "PlaasMark",
      type: "website",
    },
  };
}

export default function LocationStorePage() {
  return <StorePageClient />;
}
