"use client";

import Link from "next/link";
import styled from "styled-components";

const SHADOW_SOFT = "0 2px 8px rgba(0,0,0,0.05)";
const BORDER_LIGHT = "1px solid #eee";

export const FullBleed = styled.div`
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  padding-left: 16px;
  padding-right: 16px;

  @media (min-width: 768px) {
    padding-left: 24px;
    padding-right: 24px;
  }
`;

export const DashboardPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 0 32px;
`;

export const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

export const PageSubtitle = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};
`;

export const Section = styled.section`
  margin-bottom: 32px;
`;

export const Card = styled.section`
  border-radius: 12px;
  background: #ffffff;
  border: ${BORDER_LIGHT};
  box-shadow: ${SHADOW_SOFT};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.07);
  }
`;

export const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.25;
`;

export const Muted = styled.p`
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  color: #777;
`;

export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 540px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const Kpi = styled.div`
  border-radius: 12px;
  padding: 16px;
  border: ${BORDER_LIGHT};
  background: #ffffff;
`;

export const KpiLabel = styled.div`
  font-size: 0.8rem;
  color: #777;
  font-weight: 600;
`;

export const KpiValue = styled.div`
  margin-top: 6px;
  font-size: 1.4rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textDark};
`;

export const ActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 0;
`;

export const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-weight: 800;
  font-size: 0.95rem;
  line-height: 1;
  text-decoration: none;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
  transition:
    transform 0.12s ease,
    background 0.12s ease,
    box-shadow 0.12s ease;

  &:hover {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

export const StorePrimaryLink = styled(PrimaryLink)<{ $color: string }>`
  background: ${({ $color }) => $color};
  border-color: ${({ $color }) => $color};

  &:hover {
    background: ${({ $color }) => $color};
    border-color: ${({ $color }) => $color};
    filter: brightness(0.92);
  }
`;

export const SecondaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: ${BORDER_LIGHT};
  background: #ffffff;
  color: ${({ theme }) => theme.colors.textDark};
  font-weight: 800;
  font-size: 0.95rem;
  line-height: 1;
  text-decoration: none;
  transition:
    transform 0.12s ease,
    background 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.colors.background};
    border-color: #e5e5e5;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

export function formatCurrencyZar(value: number) {
  if (!Number.isFinite(value)) return "R 0,00";
  return `R ${value.toFixed(2).replace(".", ",")}`;
}
