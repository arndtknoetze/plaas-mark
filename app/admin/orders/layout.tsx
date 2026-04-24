import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Orders",
  robots: { index: false, follow: false },
};

export default function AdminOrdersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
