"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResolvedLocationSlug } from "@/lib/useResolvedLocationSlug";

export function LegacyLocationRedirect({ to }: { to: "shop" | "cart" }) {
  const router = useRouter();
  const location = useResolvedLocationSlug();

  useEffect(() => {
    if (!location) {
      router.replace("/");
      return;
    }
    router.replace(`/${encodeURIComponent(location)}/${to}`);
  }, [location, router, to]);

  return null;
}
