"use client";

import Link from "next/link";
import styled, { css } from "styled-components";

export const spacing = {
  1: 8,
  2: 16,
  3: 24,
  4: 32,
} as const;

export const Card = styled.div<{ $pad?: "sm" | "md" | "lg" }>`
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.05),
    0 8px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: ${({ $pad }) => ($pad === "sm" ? 12 : $pad === "lg" ? 20 : 16)}px;
`;

export const Muted = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.55;
`;

export const SectionHeaderWrap = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 950;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textDark};
`;

export const SectionSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};
`;

export const SectionActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const buttonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  font-weight: 900;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

export const PrimaryButton = styled.button`
  ${buttonStyles};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    border-color: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  ${buttonStyles};
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #ffffff;
  color: ${({ theme }) => theme.colors.textDark};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    border-color: rgba(0, 0, 0, 0.18);
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const SecondaryLink = styled(Link)`
  ${buttonStyles};
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #ffffff;
  color: ${({ theme }) => theme.colors.textDark};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    border-color: rgba(0, 0, 0, 0.18);
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export function SectionHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <SectionHeaderWrap>
      <div>
        <SectionTitle>{title}</SectionTitle>
        {subtitle ? <SectionSubtitle>{subtitle}</SectionSubtitle> : null}
      </div>
      {actions ? <SectionActions>{actions}</SectionActions> : null}
    </SectionHeaderWrap>
  );
}

export const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px;
`;

export const StatCol = styled.div<{ $span?: number }>`
  grid-column: span ${({ $span }) => $span ?? 3};
  min-width: 0;

  @media (max-width: 980px) {
    grid-column: span 6;
  }

  @media (max-width: 560px) {
    grid-column: span 12;
  }
`;

export const StatCardWrap = styled(Card)`
  padding: 14px 14px 16px;
`;

export const StatLabel = styled.div`
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 950;
  color: ${({ theme }) => theme.colors.textLight};
`;

export const StatValue = styled.div`
  margin-top: 8px;
  font-size: 1.75rem;
  font-weight: 980;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};
`;

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <StatCardWrap>
      <StatLabel>{label}</StatLabel>
      <StatValue>{value}</StatValue>
    </StatCardWrap>
  );
}

export const TableCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

export const TableScroll = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
`;

export const Th = styled.th`
  text-align: left;
  padding: 12px 14px;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textLight};
  background: ${({ theme }) => theme.colors.background};
  white-space: nowrap;
`;

export const Td = styled.td<{ $strong?: boolean }>`
  padding: 12px 14px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  color: ${({ theme }) => theme.colors.textDark};
  font-weight: ${({ $strong }) => ($strong ? 900 : 600)};
  vertical-align: top;
`;

export const EmptyStateWrap = styled(Card)`
  display: grid;
  place-items: center;
  text-align: center;
  padding: 28px 16px;
`;

export const EmptyTitle = styled.div`
  font-weight: 950;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.textDark};
`;

export const EmptyBody = styled.div`
  margin-top: 6px;
  font-size: 0.92rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};
  max-width: 52ch;
`;

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <EmptyStateWrap>
      <div>
        <EmptyTitle>{title}</EmptyTitle>
        {body ? <EmptyBody>{body}</EmptyBody> : null}
        {action ? <div style={{ marginTop: 14 }}>{action}</div> : null}
      </div>
    </EmptyStateWrap>
  );
}
