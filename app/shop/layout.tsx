import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
};

export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
