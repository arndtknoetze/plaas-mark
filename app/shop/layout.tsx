import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Winkel",
};

export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
