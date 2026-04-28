"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/app/login/LoginForm";
import { loadStoredSession } from "@/lib/session-storage";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Session is stored in localStorage, so this check must be client-side.
    if (loadStoredSession()) {
      router.replace("/profile");
    }
  }, [router]);

  return <LoginForm />;
}
