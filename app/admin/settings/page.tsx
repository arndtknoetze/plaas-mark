import { notFound } from "next/navigation";
import { Card, SectionHeader } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  if (process.env.ADMIN_ROUTES_ENABLED !== "true") {
    notFound();
  }

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Basic operational controls." />
      <Card>
        <p style={{ margin: 0, color: "#334155", lineHeight: 1.6 }}>
          Placeholder for site settings (feature flags, banners, maintenance
          mode, etc.).
        </p>
        <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "#475569" }}>
          <li>Enable/disable admin routes</li>
          <li>Set default location</li>
          <li>Toggle store approval workflow</li>
        </ul>
      </Card>
    </div>
  );
}
