"use client";

import { useEffect } from "react";
import styled, { keyframes } from "styled-components";
import type { Product } from "@/types/product";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const sheetIn = keyframes`
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.46);
  display: grid;
  align-items: end;
  justify-items: stretch;
  padding: 0;
  animation: ${fadeIn} 140ms ease-out;

  @media (min-width: 640px) {
    align-items: center;
    justify-items: center;
    padding: 18px;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Sheet = styled.section`
  width: 100%;
  background: #ffffff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  animation: ${sheetIn} 160ms ease-out;

  @media (min-width: 640px) {
    max-width: 520px;
    border-radius: 18px;
    max-height: min(88vh, 720px);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Media = styled.div<{ $hasImage: boolean }>`
  position: relative;
  aspect-ratio: 1 / 1;
  background: ${({ $hasImage, theme }) =>
    $hasImage
      ? "#f0f2ed"
      : `linear-gradient(145deg, ${theme.colors.background} 0%, #e4e8df 100%)`};
`;

const Img = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Header = styled.header`
  padding: 14px 14px 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const TitleWrap = styled.div`
  min-width: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.25;
  font-weight: 950;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textDark};
`;

const StoreName = styled.div`
  margin-top: 6px;
  font-size: 0.85rem;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.textLight};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CloseButton = styled.button`
  flex: 0 0 auto;
  height: 38px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #ffffff;
  font-weight: 950;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textDark};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Content = styled.div`
  padding: 10px 14px 14px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

const PriceRow = styled.div`
  margin-top: 10px;
  font-size: 1.1rem;
  font-weight: 950;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.primary};
`;

const Description = styled.p`
  margin: 10px 0 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: rgba(0, 0, 0, 0.68);
`;

const ChipRow = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(245, 245, 240, 0.8);
  font-size: 0.8rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.68);
`;

const Footer = styled.footer`
  padding: 12px 14px 14px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.96);
`;

const AddButton = styled.button`
  width: 100%;
  min-height: 46px;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 950;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.08s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:active:not(:disabled) {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

function formatPrice(value: number) {
  return `R ${value.toFixed(2).replace(".", ",")}`;
}

export function ProductDetailModal({
  open,
  product,
  onClose,
  onAddToCart,
  addLabel,
  closeLabel,
  isAddDisabled,
}: {
  open: boolean;
  product: Product;
  onClose: () => void;
  onAddToCart: () => void;
  addLabel: string;
  closeLabel: string;
  isAddDisabled: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const imageSrc = product.images?.[0] ?? product.image;
  const hasImage = Boolean(imageSrc);
  const unitText = product.unit ? ` /${product.unit}` : "";
  const tags = (product.tags ?? []).slice(0, 10);

  return (
    <Overlay
      role="dialog"
      aria-modal="true"
      aria-label={product.title}
      onClick={onClose}
    >
      <Sheet onClick={(e) => e.stopPropagation()}>
        <Media $hasImage={hasImage} aria-hidden={!hasImage}>
          {hasImage ? (
            <Img src={imageSrc} alt={product.title} loading="eager" />
          ) : null}
        </Media>

        <Header>
          <TitleWrap>
            <Title>{product.title}</Title>
            {product.vendorName ? (
              <StoreName>{product.vendorName}</StoreName>
            ) : null}
          </TitleWrap>
          <CloseButton type="button" onClick={onClose}>
            {closeLabel}
          </CloseButton>
        </Header>

        <Content>
          <PriceRow>
            {formatPrice(product.price)}
            {unitText}
          </PriceRow>

          {product.description ? (
            <Description>{product.description}</Description>
          ) : null}

          {tags.length ? (
            <ChipRow aria-label="Tags">
              {tags.map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
            </ChipRow>
          ) : null}
        </Content>

        <Footer>
          <AddButton
            type="button"
            disabled={isAddDisabled}
            onClick={onAddToCart}
          >
            {addLabel}
          </AddButton>
        </Footer>
      </Sheet>
    </Overlay>
  );
}
