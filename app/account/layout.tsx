import { Suspense } from "react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<p style={{ margin: 0 }}>Laai…</p>}>
      {children}
    </Suspense>
  );
}
