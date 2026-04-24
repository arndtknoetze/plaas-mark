"use client";

import Link from "next/link";
import styled from "styled-components";
import { useCart } from "@/lib/cart-context";

const Title = styled.h1`
  margin: 0 0 20px;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    margin-bottom: 24px;
    font-size: 1.75rem;
  }
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Row = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const LineInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const LineName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
`;

const LineMeta = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const LineTotal = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const RemoveBtn = styled.button`
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.textLight};
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.background};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Empty = styled.p`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

function formatPrice(value: number) {
  return `R ${value.toFixed(2).replace(".", ",")}`;
}

export default function CartPage() {
  const { items, removeFromCart } = useCart();

  return (
    <>
      <BackLink href="/">← Terug na winkel</BackLink>
      <Title>Jou mandjie</Title>
      {items.length === 0 ? (
        <Empty>Jou mandjie is leeg.</Empty>
      ) : (
        <List>
          {items.map((line) => (
            <Row key={line.productId}>
              <LineInfo>
                <LineName>{line.name}</LineName>
                <LineMeta>
                  {formatPrice(line.price)} × {line.quantity}
                </LineMeta>
                <LineTotal>
                  {formatPrice(line.price * line.quantity)}
                </LineTotal>
              </LineInfo>
              <RemoveBtn
                type="button"
                onClick={() => removeFromCart(line.productId)}
              >
                Verwyder
              </RemoveBtn>
            </Row>
          ))}
        </List>
      )}
    </>
  );
}
