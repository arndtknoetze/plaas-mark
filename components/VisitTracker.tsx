"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type Payload = {
  path: string;
  referrer?: string;
  locale?: string;
  props?: Record<string, unknown>;
};

function safeUrl(u: string | null | undefined): string | undefined {
  const s = (u ?? "").trim();
  return s ? s : undefined;
}

export function VisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const path = useMemo(() => {
    const qs = searchParams?.toString() ?? "";
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!path) return;
    if (lastPathRef.current === path) return;

    const payload: Payload = {
      path,
      referrer:
        lastPathRef.current ??
        safeUrl(
          typeof document !== "undefined" ? document.referrer : undefined,
        ),
      locale:
        safeUrl(
          typeof navigator !== "undefined" ? navigator.language : undefined,
        ) ??
        safeUrl(
          typeof document !== "undefined"
            ? document.documentElement.lang
            : undefined,
        ),
    };

    lastPathRef.current = path;

    try {
      void fetch("/api/track/visit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch {
      /* ignore */
    }
  }, [path]);

  return null;
}
