"use client";

import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";
import { loadStoredCustomer } from "@/lib/customer-storage";

type OrderItemRow = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  vendorName: string;
};

type OrderRow = {
  id: string;
  createdAt: string;
  notes: string | null;
  items: OrderItemRow[];
};

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

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  margin: 0 0 20px;
  font-size: 0.9375rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Input = styled.input`
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #d8d8d4;
  border-radius: 10px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(46, 94, 62, 0.15);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  min-height: 48px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const ErrorMsg = styled.p`
  margin: 0 0 16px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #8a1c1c;
  background: #fdeaea;
  border: 1px solid #f0c4c4;
`;

const EmptyHint = styled.p`
  margin: 0;
  padding: 16px 14px;
  border-radius: 10px;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textLight};
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.05);
`;

const OrderCard = styled.article`
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.05);
`;

const OrderHead = styled.div`
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ecece8;
`;

const OrderMeta = styled.p`
  margin: 0 0 4px;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const OrderId = styled.span`
  display: block;
  font-size: 0.75rem;
  word-break: break-all;
  color: ${({ theme }) => theme.colors.textLight};
`;

const OrderNotes = styled.p`
  margin: 8px 0 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textDark};
`;

const ItemList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemRow = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.9375rem;
`;

const ItemMain = styled.div`
  min-width: 0;
`;

const ItemName = styled.span`
  display: block;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
`;

const ItemVendor = styled.span`
  display: block;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: 2px;
`;

const ItemQty = styled.span`
  display: block;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: 4px;
`;

const ItemPrice = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const OrderTotal = styled.p`
  margin: 12px 0 0;
  padding-top: 10px;
  border-top: 1px solid #ecece8;
  font-size: 0.9375rem;
  font-weight: 700;
  text-align: right;
  color: ${({ theme }) => theme.colors.textDark};
`;

function formatPrice(value: number) {
  return `R ${value.toFixed(2).replace(".", ",")}`;
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function isOrderItemRow(value: unknown): value is OrderItemRow {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    Number.isFinite(o.price) &&
    typeof o.quantity === "number" &&
    Number.isInteger(o.quantity) &&
    typeof o.vendorName === "string"
  );
}

function isOrderRow(value: unknown): value is OrderRow {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.createdAt !== "string") return false;
  if (o.notes !== null && typeof o.notes !== "string") return false;
  if (!Array.isArray(o.items) || !o.items.every(isOrderItemRow)) return false;
  return true;
}

function parseOrdersResponse(data: unknown): OrderRow[] | null {
  if (!data || typeof data !== "object") return null;
  const orders = (data as { orders?: unknown }).orders;
  if (!Array.isArray(orders) || !orders.every(isOrderRow)) return null;
  return orders;
}

export default function MyOrdersPage() {
  const [phone, setPhone] = useState(() => {
    if (typeof window === "undefined") return "";
    return loadStoredCustomer()?.phone ?? "";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = phone.trim().replace(/\s+/g, " ");
    if (!q) {
      setError("Enter the phone number you used at checkout.");
      setOrders(null);
      return;
    }
    setError(null);
    setLoading(true);
    setOrders(null);
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(q)}`);
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Could not load orders.";
        throw new Error(msg);
      }
      const parsed = parseOrdersResponse(data);
      if (!parsed) throw new Error("Invalid response from server.");
      setOrders(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackLink href="/shop">← Back to shop</BackLink>
      <Title>My orders</Title>
      <Subtitle>
        Enter the phone number from your checkout. We will list every order
        linked to that number.
      </Subtitle>

      <Form onSubmit={handleSubmit}>
        <Field>
          <Label htmlFor="my-orders-phone">Phone</Label>
          <Input
            id="my-orders-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Same number as at checkout"
          />
        </Field>
        <SubmitBtn type="submit" disabled={loading}>
          {loading ? "Loading…" : "Show my orders"}
        </SubmitBtn>
      </Form>

      {error ? <ErrorMsg role="alert">{error}</ErrorMsg> : null}

      {orders && orders.length === 0 ? (
        <EmptyHint>
          No orders found for that phone number. Check the number matches
          checkout exactly, or place an order first.
        </EmptyHint>
      ) : null}

      {orders && orders.length > 0
        ? orders.map((order) => {
            const total = order.items.reduce(
              (sum, line) => sum + line.price * line.quantity,
              0,
            );
            return (
              <OrderCard key={order.id}>
                <OrderHead>
                  <OrderMeta>{formatWhen(order.createdAt)}</OrderMeta>
                  <OrderId>Order #{order.id}</OrderId>
                  {order.notes ? (
                    <OrderNotes>
                      <strong>Notes:</strong> {order.notes}
                    </OrderNotes>
                  ) : null}
                </OrderHead>
                <ItemList>
                  {order.items.map((line) => (
                    <ItemRow key={line.id}>
                      <ItemMain>
                        <ItemName>{line.name}</ItemName>
                        {line.vendorName ? (
                          <ItemVendor>{line.vendorName}</ItemVendor>
                        ) : null}
                        <ItemQty>
                          {formatPrice(line.price)} × {line.quantity}
                        </ItemQty>
                      </ItemMain>
                      <ItemPrice>
                        {formatPrice(line.price * line.quantity)}
                      </ItemPrice>
                    </ItemRow>
                  ))}
                </ItemList>
                <OrderTotal>Total: {formatPrice(total)}</OrderTotal>
              </OrderCard>
            );
          })
        : null}
    </>
  );
}
