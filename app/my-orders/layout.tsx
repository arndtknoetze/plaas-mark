import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My orders",
};

export default function MyOrdersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
