"use client";

import Link from "next/link";
import styled from "styled-components";

const Row = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 950;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.15;

  @media (min-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Action = styled(Link)`
  flex: 0 0 auto;
  font-size: 0.875rem;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
    border-radius: 6px;
  }
`;

export function SectionHeader({
  title,
  actionLabel,
  actionHref,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <Row>
      <Title>{title}</Title>
      {actionLabel && actionHref ? (
        <Action href={actionHref}>{actionLabel}</Action>
      ) : null}
    </Row>
  );
}
