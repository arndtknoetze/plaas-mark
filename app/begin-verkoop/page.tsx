import type { Metadata } from "next";
import { Suspense } from "react";
import { BeginVerkoopClient } from "@/app/begin-verkoop/BeginVerkoopClient";

export const metadata: Metadata = {
  title: "Begin verkoop",
};

export default function BeginVerkoopPage() {
  return (
    <Suspense fallback={<p style={{ margin: 0 }}>Laai…</p>}>
      <BeginVerkoopClient />
    </Suspense>
  );
}
