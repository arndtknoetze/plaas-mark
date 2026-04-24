"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { Container } from "@/components/Container";
import { useCart } from "@/lib/cart-context";

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: #ffffff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04);
`;

const Inner = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 56px;
  padding-top: 8px;
  padding-bottom: 8px;

  @media (min-width: 768px) {
    min-height: 64px;
  }
`;

const Brand = styled(Link)`
  position: relative;
  display: block;
  height: 30px;
  width: 148px;
  flex-shrink: 0;
  text-decoration: none;

  @media (min-width: 768px) {
    height: 34px;
    width: 168px;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textDark};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const CartLink = styled(Link)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.textDark};
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.accent};
`;

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Header() {
  const { items } = useCart();
  const count = items.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <Bar>
      <Inner>
        <Brand href="/">
          <Image
            src="/logo.png"
            alt="PlaasMark"
            fill
            sizes="(max-width: 767px) 148px, 168px"
            priority
            style={{ objectFit: "contain", objectPosition: "left center" }}
          />
        </Brand>
        <Actions>
          <CartLink
            href="/cart"
            aria-label={count ? `Mandjie, ${count} items` : "Mandjie"}
          >
            <CartIcon />
            {count > 0 ? (
              <CartBadge>{count > 99 ? "99+" : count}</CartBadge>
            ) : null}
          </CartLink>
          <IconButton type="button" aria-label="Menu">
            <MenuIcon />
          </IconButton>
        </Actions>
      </Inner>
    </Bar>
  );
}
