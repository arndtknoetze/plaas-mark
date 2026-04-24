"use client";

import styled from "styled-components";
import { Container } from "@/components/Container";
import { Header } from "@/components/Header";
import { PageWrapper } from "@/components/PageWrapper";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const Root = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
`;

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Root>
      <Header />
      <ServiceWorkerRegister />
      <Main>
        <PageWrapper>
          <Container>{children}</Container>
        </PageWrapper>
      </Main>
      <PwaInstallPrompt />
    </Root>
  );
}
