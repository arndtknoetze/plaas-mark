"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingClient } from "@/app/onboarding/OnboardingClient";
import { loadStoredSession } from "@/lib/session-storage";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    if (!loadStoredSession()) {
      router.replace("/register");
    }
  }, [router]);

  return <OnboardingClient />;
}
