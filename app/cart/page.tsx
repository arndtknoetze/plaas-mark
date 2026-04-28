"use client";

import Link from "next/link";
import styled from "styled-components";
import { useCart } from "@/lib/cart-context";
import { groupCartItemsByStore } from "@/lib/cart-utils";
import { useLanguage } from "@/lib/useLanguage";

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
  gap: 10px;
`;

const StoreSection = styled.section`
  display: grid;
  gap: 10px;
  padding: 16px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 10px 26px rgba(0, 0, 0, 0.06);
`;

const StoreHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`;

const StoreName = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Row = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const LineInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
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

const Controls = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const QtyBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.16);
  background: #ffffff;
  color: ${({ theme }) => theme.colors.textDark};
  font-size: 1.05rem;
  font-weight: 950;
  cursor: pointer;
  transition:
    transform 0.1s ease,
    border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const QtyValue = styled.span`
  min-width: 22px;
  text-align: center;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Subtotal = styled.div`
  min-width: 88px;
  text-align: right;
  font-weight: 950;
  color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const Empty = styled.p`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const CartTotalBar = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  padding: 16px 16px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.06);
`;

const CartTotalLabel = styled.span`
  font-size: 0.9375rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textDark};
`;

const CartTotalValue = styled.span`
  font-size: 1.05rem;
  font-weight: 950;
  color: ${({ theme }) => theme.colors.primary};
`;

const ProceedButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 52px;
  margin-top: 14px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const StoreFooter = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: 2px;
`;

const StoreFooterLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.textDark};
`;

const StoreFooterTotal = styled.span`
  font-size: 0.95rem;
  font-weight: 950;
  color: ${({ theme }) => theme.colors.primary};
`;

function formatPrice(value: number) {
  return `R ${value.toFixed(2).replace(".", ",")}`;
}

function shortId(id: string) {
  const v = id.trim();
  if (!v) return "";
  if (v.length <= 10) return v;
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

export default function CartPage() {
  const { items, updateQuantity } = useCart();
  const { t, language } = useLanguage();
  const { groups, total } = groupCartItemsByStore(items);

  return (
    <>
      <BackLink href="/shop">{t("backToShop")}</BackLink>
      <Title>{t("yourCart")}</Title>
      {items.length === 0 ? (
        <Empty>{t("cartEmpty")}</Empty>
      ) : (
        <>
          {groups.map((g) => (
            <StoreSection key={`${g.storeId}__${g.storeName}`}>
              <StoreHeader>
                <StoreName>
                  {g.storeName ||
                    (g.storeId
                      ? `${t("storeFilterLabel")} ${shortId(g.storeId)}`
                      : language === "af"
                        ? "Onbekende winkel"
                        : "Unknown store")}
                </StoreName>
              </StoreHeader>
              <List aria-label={g.storeName || "Store"}>
                {g.items.map((line) => (
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
                    <Controls aria-label={`Quantity for ${line.name}`}>
                      <QtyBtn
                        type="button"
                        aria-label={`Decrease quantity for ${line.name}`}
                        onClick={() =>
                          updateQuantity(line.productId, line.quantity - 1)
                        }
                      >
                        −
                      </QtyBtn>
                      <QtyValue aria-label="Quantity">{line.quantity}</QtyValue>
                      <QtyBtn
                        type="button"
                        aria-label={`Increase quantity for ${line.name}`}
                        onClick={() =>
                          updateQuantity(line.productId, line.quantity + 1)
                        }
                      >
                        +
                      </QtyBtn>
                    </Controls>
                    <Subtotal aria-label="Subtotal">
                      {formatPrice(line.price * line.quantity)}
                    </Subtotal>
                  </Row>
                ))}
              </List>
              <StoreFooter aria-label="Store total">
                <StoreFooterLabel>
                  {language === "af" ? "Totaal" : "Total"}
                </StoreFooterLabel>
                <StoreFooterTotal>{formatPrice(g.total)}</StoreFooterTotal>
              </StoreFooter>
            </StoreSection>
          ))}

          <CartTotalBar aria-label="Cart total">
            <CartTotalLabel>
              {language === "af" ? "Totaal" : "Total"}
            </CartTotalLabel>
            <CartTotalValue>{formatPrice(total)}</CartTotalValue>
          </CartTotalBar>

          <ProceedButton href="/checkout">{t("goToCheckout")}</ProceedButton>
        </>
      )}
    </>
  );
}
