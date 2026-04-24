"use client";

import styled from "styled-components";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/types/product";

const Card = styled.article`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const Thumb = styled.div`
  aspect-ratio: 4 / 3;
  background: linear-gradient(
    145deg,
    ${({ theme }) => theme.colors.background} 0%,
    #e4e8df 100%
  );
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 14px 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`;

const Price = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: -0.02em;

  @media (min-width: 768px) {
    font-size: 1.0625rem;
  }
`;

const Unit = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Footer = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.background};
`;

const AddButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

function formatPrice(value: number) {
  return `R ${value.toFixed(2).replace(".", ",")}`;
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Card>
      <Thumb aria-hidden />
      <Body>
        <Title>{product.title}</Title>
        <Meta>
          <Price>{formatPrice(product.price)}</Price>
          {product.unit ? <Unit>{product.unit}</Unit> : null}
        </Meta>
        <Footer>
          <AddButton
            type="button"
            onClick={() =>
              addToCart({
                productId: product.id,
                name: product.title,
                price: product.price,
                quantity: 1,
              })
            }
          >
            Voeg by mandjie
          </AddButton>
        </Footer>
      </Body>
    </Card>
  );
}
