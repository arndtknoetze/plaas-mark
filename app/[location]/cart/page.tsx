import CartPageClient from "@/components/CartPageClient";

export default async function LocationCartPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location } = await params;
  return <CartPageClient locationSlug={location} />;
}
