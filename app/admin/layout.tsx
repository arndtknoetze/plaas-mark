import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminCookieName } from "@/lib/admin-session";
import { getAdminSessionOrNull } from "@/lib/admin-session";
import { prisma } from "@/lib/db";
import { getPublicLocationOrNull } from "@/lib/location";
import { DashboardLayout } from "@/components/admin/DashboardLayout";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (process.env.ADMIN_ROUTES_ENABLED !== "true") {
    notFound();
  }

  const [location, session] = await Promise.all([
    getPublicLocationOrNull(),
    getAdminSessionOrNull(),
  ]);

  const userName = session
    ? ((
        await prisma.member
          .findUnique({
            where: { id: session.memberId },
            select: { name: true },
          })
          .catch(() => null)
      )?.name ?? "Admin")
    : "Admin";

  return (
    <DashboardLayout
      locationName={location?.name ?? "—"}
      userName={userName}
      sidebarFooter={
        <form
          action={async () => {
            "use server";
            const { cookies } = await import("next/headers");
            const store = await cookies();
            store.set(getAdminCookieName(), "", { path: "/", maxAge: 0 });
          }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              minHeight: 40,
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "#ffffff",
              fontWeight: 950,
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </form>
      }
    >
      {children}
    </DashboardLayout>
  );
}
