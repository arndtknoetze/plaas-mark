import type { Metadata } from "next";
import { Suspense } from "react";
import { BeginVerkoopClient } from "@/app/begin-verkoop/BeginVerkoopClient";
import { indexableRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Start selling",
  robots: indexableRobots,
  alternates: { canonical: "/begin-verkoop" },
};

export default function BeginVerkoopPage() {
  return (
    <Suspense fallback={<p style={{ margin: 0 }}>Loading…</p>}>
      <BeginVerkoopClient />
    </Suspense>
  );
}
