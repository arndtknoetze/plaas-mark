"use client";

import dynamic from "next/dynamic";
import styled from "styled-components";
import { Container } from "@/components/Container";
import { BetaWelcomeModal } from "@/components/BetaWelcomeModal";
import { PageWrapper } from "@/components/PageWrapper";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { ToastProvider } from "@/components/ToastProvider";
import { VisitTracker } from "@/components/VisitTracker";
import type { PublicLocation } from "@/lib/location";

const Header = dynamic(
  () => import("@/components/Header").then((m) => m.Header),
  { ssr: false },
);

const Root = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  padding-top: var(--pm-header-offset, 0px);
`;

export function Shell({
  children,
  location,
  variant = "site",
}: {
  children: React.ReactNode;
  location: PublicLocation | null;
  variant?: "site" | "admin";
}) {
  if (variant === "admin") {
    return (
      <ToastProvider>
        <Root>{children}</Root>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Root>
        <Header location={location} />
        <BetaWelcomeModal />
        <ServiceWorkerRegister />
        <VisitTracker />
        <Main>
          <PageWrapper>
            <Container>{children}</Container>
          </PageWrapper>
        </Main>
        <PwaInstallPrompt />
      </Root>
    </ToastProvider>
  );
}
