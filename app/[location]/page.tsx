import { redirect } from "next/navigation";

export default async function LocationEntryPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location } = await params;
  redirect(`/${encodeURIComponent(location)}/shop`);
}
