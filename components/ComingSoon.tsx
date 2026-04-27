"use client";

import Image from "next/image";
import Link from "next/link";
import styled, { keyframes } from "styled-components";

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const drift = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(2%, -1%) scale(1.03); }
`;

const Root = styled.div`
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px 48px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
`;

const Glow = styled.div`
  position: absolute;
  inset: -40%;
  background:
    radial-gradient(
      ellipse 55% 45% at 50% 0%,
      rgba(232, 155, 44, 0.18) 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse 50% 40% at 85% 75%,
      rgba(46, 94, 62, 0.12) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse 45% 35% at 10% 60%,
      rgba(76, 122, 77, 0.1) 0%,
      transparent 45%
    );
  animation: ${drift} 18s ease-in-out infinite;
  pointer-events: none;
`;

const Grain = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.04;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  max-width: min(1100px, 100%);
  width: 100%;
  text-align: center;
  animation: ${fadeUp} 0.85s ease-out both;
`;

const LogoWrap = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 auto 10px;
  line-height: 0;

  @media (min-width: 768px) {
    margin-bottom: 12px;
  }
`;

const Badge = styled.span`
  display: inline-block;
  margin-bottom: 14px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary};
  background: rgba(46, 94, 62, 0.1);
  border: 1px solid rgba(46, 94, 62, 0.2);
`;

const Title = styled.h1`
  margin: 0 0 14px;
  font-size: clamp(1.65rem, 4.5vw, 2.25rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.04em;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Accent = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

const Subtitle = styled.p`
  margin: 0 0 28px;
  font-size: 1.0625rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};

  @media (min-width: 768px) {
    font-size: 1.125rem;
    margin-bottom: 32px;
  }
`;

const Divider = styled.div`
  width: 56px;
  height: 3px;
  margin: 0 auto 24px;
  border-radius: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    ${({ theme }) => theme.colors.accent},
    transparent
  );
`;

const Foot = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ShopHint = styled(Link)`
  display: inline-block;
  margin-top: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

const CtaRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 22px auto 0;
  width: min(440px, 100%);
`;

const PrimaryCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  padding: 0 18px;
  border-radius: 14px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.06),
    0 8px 18px rgba(46, 94, 62, 0.18);

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
  }
`;

const SecondaryCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 18px;
  border-radius: 14px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.primary};
  background: rgba(46, 94, 62, 0.06);
  border: 1px solid rgba(46, 94, 62, 0.18);
  text-decoration: none;

  &:hover {
    background: rgba(46, 94, 62, 0.1);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
  }
`;

export function ComingSoon() {
  return (
    <Root>
      <Glow aria-hidden />
      <Grain aria-hidden />
      <Content>
        <LogoWrap>
          <Image
            src="/logo.png"
            alt="PlaasMark"
            width={800}
            height={260}
            priority
            sizes="(max-width: 767px) 96vw, (max-width: 1023px) 92vw, 1080px"
            style={{
              width: "min(96vw, 1080px)",
              maxWidth: "50%",
              height: "auto",
            }}
          />
        </LogoWrap>
        <Badge>Kom binnekort</Badge>
        <Title>
          Vars van die plaas, <Accent>nader aan jou</Accent>
        </Title>
        <Divider aria-hidden />
        <Subtitle>
          Ons bou iets spesiaal vir jou gemeenskap. Hou die spasie — PlaasMark
          maak dit binnekort makliker om plaasvars direk te ondersteun.
        </Subtitle>
        <CtaRow>
          <PrimaryCta href="/register">Registreer (gratis)</PrimaryCta>
          <SecondaryCta href="/register?role=seller">
            Ek wil verkoop
          </SecondaryCta>
        </CtaRow>
        <Foot>© {new Date().getFullYear()} PlaasMark</Foot>
        <ShopHint href="/shop">Voorskou: kyk na die winkel →</ShopHint>
      </Content>
    </Root>
  );
}
