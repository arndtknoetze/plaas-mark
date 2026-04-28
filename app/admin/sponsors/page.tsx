import { notFound } from "next/navigation";
import { EmptyState, SectionHeader } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

export default async function AdminSponsorsPage() {
  if (process.env.ADMIN_ROUTES_ENABLED !== "true") {
    notFound();
  }

  return (
    <div>
      <SectionHeader
        title="Sponsors"
        subtitle="A simple placeholder section for sponsor management."
      />
      <EmptyState
        title="No sponsor tooling yet"
        body="This section is ready for sponsor onboarding, tiers, and placements when you’re ready."
      />
    </div>
  );
}
