import type { Metadata } from "next";
import { indexableRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "My orders",
  robots: indexableRobots,
  alternates: { canonical: "/my-orders" },
};

export default function MyOrdersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
