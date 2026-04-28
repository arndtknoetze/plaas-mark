"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegisterClient } from "@/app/register/RegisterClient";
import { loadStoredSession } from "@/lib/session-storage";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Session is stored in localStorage, so this check must be client-side.
    if (loadStoredSession()) {
      router.replace("/profile");
    }
  }, [router]);

  return <RegisterClient />;
}
