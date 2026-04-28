import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminLoginForm } from "./ui";

export const metadata: Metadata = {
  title: "Admin — Login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  if (process.env.ADMIN_ROUTES_ENABLED !== "true") {
    notFound();
  }
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px" }}>
      <AdminLoginForm />
    </div>
  );
}
