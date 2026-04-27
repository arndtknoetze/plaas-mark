"use client";

import { useState } from "react";
import styled from "styled-components";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/types/product";

const Card = styled.article`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.06);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    box-shadow:
      0 2px 0 rgba(0, 0, 0, 0.04),
      0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const Thumb = styled.div<{ $hasImage: boolean }>`
  position: relative;
  aspect-ratio: 4 / 3;
  background: ${({ $hasImage, theme }) =>
    $hasImage
      ? "#e8ebe4"
      : `linear-gradient(
    145deg,
    ${theme.colors.background} 0%,
    #e4e8df 100%
  )`};
`;

const ThumbImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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

const Vendor = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textLight};
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

const AddError = styled.p`
  margin: 0 0 8px;
  font-size: 0.8125rem;
  line-height: 1.4;
  font-weight: 600;
  color: #b42318;
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
  transition:
    background 0.15s ease,
    transform 0.1s ease;

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
  const [addError, setAddError] = useState<string | null>(null);
  const hasImage = Boolean(product.image);

  return (
    <Card>
      <Thumb $hasImage={hasImage} aria-hidden={!hasImage}>
        {hasImage ? (
          <ThumbImg src={product.image} alt={product.title} loading="lazy" />
        ) : null}
      </Thumb>
      <Body>
        <Title>{product.title}</Title>
        {product.vendorName ? <Vendor>{product.vendorName}</Vendor> : null}
        <Meta>
          <Price>{formatPrice(product.price)}</Price>
          {product.unit ? <Unit>{product.unit}</Unit> : null}
        </Meta>
        <Footer>
          {addError ? <AddError role="alert">{addError}</AddError> : null}
          <AddButton
            type="button"
            onClick={() => {
              const r = addToCart({
                productId: product.id,
                name: product.title,
                price: product.price,
                quantity: 1,
                vendorId: product.vendorId,
                vendorName: product.vendorName,
                locationId: product.locationId,
              });
              if (!r.ok) setAddError(r.error);
              else setAddError(null);
            }}
          >
            Voeg by mandjie
          </AddButton>
        </Footer>
      </Body>
    </Card>
  );
}
