import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My store orders",
};

export default function AccountStoreOrdersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
