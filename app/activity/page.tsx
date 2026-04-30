import type { Metadata } from "next";
import { Suspense } from "react";
import { ActivityPageClient } from "./ActivityPageClient";
import { indexableRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Aktiwiteit",
  robots: indexableRobots,
  alternates: { canonical: "/activity" },
};

export default function ActivityPage() {
  return (
    <Suspense fallback={<p style={{ margin: 0 }}>Laai…</p>}>
      <ActivityPageClient />
    </Suspense>
  );
}
