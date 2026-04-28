"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useLanguage } from "@/lib/useLanguage";
import { loadStoredCustomer } from "@/lib/customer-storage";
import { loadStoredSession } from "@/lib/session-storage";
import { isOrderStatus } from "@/lib/order-status";

type OrderItemRow = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  vendorId: string;
  vendorName: string;
};

type OrderRow = {
  id: string;
  createdAt: string;
  status: string;
  notes: string | null;
  items: OrderItemRow[];
};

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 12px;
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
  margin: 0 0 14px;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

const TopBar = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FilterInput = styled.input`
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
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

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const PhoneRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: stretch;
`;

const PhoneField = styled.input`
  flex: 1 1 160px;
  min-height: 44px;
  padding: 0 12px;
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
`;

const LaaiBtn = styled.button`
  min-height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  white-space: nowrap;

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
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #8a1c1c;
  background: #fdeaea;
  border: 1px solid #f0c4c4;
`;

const EmptyHint = styled.p`
  margin: 0;
  padding: 14px;
  border-radius: 10px;
  font-size: 0.9375rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textLight};
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.05);
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OrderCard = styled.li`
  padding: 12px 14px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.05);
`;

const OrderTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: capitalize;
  color: #ffffff;
  background: ${({ theme, $status }) => {
    const s = $status.toLowerCase();
    if (s === "completed") return "#2E5E3E";
    if (s === "ready") return "#c45c26";
    if (s === "accepted") return "#2563b8";
    return theme.colors.textLight;
  }};

  @media (max-width: 767px) {
    display: none;
  }
`;

const Meta = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const TotalLine = styled.div`
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textDark};
`;

const ItemsList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.875rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textDark};
`;

const ItemLine = styled.li`
  margin-top: 4px;
  &:first-child {
    margin-top: 0;
  }
`;

const NotesLine = styled.p`
  margin: 8px 0 0;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const LoadingLine = styled.p`
  margin: 0 0 12px;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const OrderIdShort = styled.span`
  display: block;
  margin-bottom: 6px;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ItemSub = styled.span`
  color: #6b6b66;
`;

function formatPrice(value: number) {
  return `R ${value.toFixed(2).replace(".", ",")}`;
}

function formatOrderWhen(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function orderStatusLabel(
  status: string,
  t: ReturnType<typeof useLanguage>["t"],
) {
  if (!isOrderStatus(status)) return status;
  if (status === "pending") return t("orderStatusPending");
  if (status === "accepted") return t("orderStatusAccepted");
  if (status === "ready") return t("orderStatusReady");
  return t("orderStatusCompleted");
}

function orderTotal(items: OrderItemRow[]) {
  return items.reduce((sum, line) => sum + line.price * line.quantity, 0);
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
    typeof o.vendorId === "string" &&
    typeof o.vendorName === "string"
  );
}

function isOrderRow(value: unknown): value is OrderRow {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    typeof o.createdAt !== "string" ||
    typeof o.status !== "string"
  ) {
    return false;
  }
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

function getSavedPhoneForOrders(): string {
  if (typeof window === "undefined") return "";
  const session = loadStoredSession();
  if (session?.phone?.trim()) return session.phone.trim();
  const customer = loadStoredCustomer();
  if (customer?.phone?.trim()) return customer.phone.trim();
  return "";
}

function matchesFilter(order: OrderRow, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const parts = [
    order.id,
    order.status,
    order.notes ?? "",
    ...order.items.flatMap((i) => [i.name, i.vendorName]),
  ];
  const hay = parts.join(" ").toLowerCase();
  return hay.includes(needle);
}

export default function MyOrdersPage() {
  const { t } = useLanguage();
  const [clientReady, setClientReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydration flag */
    setClientReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const fetchOrdersForPhone = useCallback(
    async (rawPhone: string) => {
      const q = rawPhone.trim().replace(/\s+/g, " ");
      if (!q) {
        setError(t("errEnterPhoneForOrders"));
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
              : t("errCouldNotLoadOrders");
          throw new Error(msg);
        }
        const parsed = parseOrdersResponse(data);
        if (!parsed) throw new Error(t("errInvalidOrdersResponse"));
        setOrders(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errGeneric"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    const saved = getSavedPhoneForOrders();
    if (!saved) return;
    /* eslint-disable react-hooks/set-state-in-effect -- initialize from localStorage after mount */
    setPhone(saved);
    /* eslint-enable react-hooks/set-state-in-effect */
    void fetchOrdersForPhone(saved);
  }, [fetchOrdersForPhone]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => matchesFilter(o, filter));
  }, [orders, filter]);

  const savedPhone = clientReady ? getSavedPhoneForOrders() : "";
  const needsPhoneFirst =
    clientReady && orders === null && !loading && !savedPhone;

  const handlePhoneLoad = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchOrdersForPhone(phone);
  };

  return (
    <>
      <BackLink href="/shop">{t("backToShop")}</BackLink>
      <Title>{t("myOrders")}</Title>

      <TopBar>
        <FilterInput
          id="orders-filter"
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t("ordersFilterPlaceholder")}
          disabled={!clientReady || orders === null || loading}
          aria-label={t("ordersFilterAria")}
        />

        {needsPhoneFirst ? (
          <form onSubmit={handlePhoneLoad}>
            <PhoneRow>
              <PhoneField
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("ordersPhonePlaceholder")}
                aria-label={t("ordersPhoneAria")}
              />
              <LaaiBtn type="submit" disabled={loading}>
                {loading ? t("loading") : t("load")}
              </LaaiBtn>
            </PhoneRow>
          </form>
        ) : null}
      </TopBar>

      {loading && orders === null ? (
        <LoadingLine>{t("loadingOrders")}</LoadingLine>
      ) : null}

      {error ? <ErrorMsg role="alert">{error}</ErrorMsg> : null}

      {orders && orders.length === 0 ? (
        <EmptyHint>{t("noOrdersInArea")}</EmptyHint>
      ) : null}

      {orders && orders.length > 0 && filteredOrders.length === 0 ? (
        <EmptyHint>{t("filterNoMatch")}</EmptyHint>
      ) : null}

      {orders && filteredOrders.length > 0 ? (
        <List>
          {filteredOrders.map((order) => {
            const total = orderTotal(order.items);
            return (
              <OrderCard key={order.id}>
                <OrderTop>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <StatusBadge $status={order.status}>
                      {orderStatusLabel(order.status, t)}
                    </StatusBadge>
                    <Meta>{formatOrderWhen(order.createdAt)}</Meta>
                  </div>
                  <TotalLine>{formatPrice(total)}</TotalLine>
                </OrderTop>
                <OrderIdShort>#{order.id}</OrderIdShort>
                <ItemsList>
                  {order.items.map((line) => (
                    <ItemLine key={line.id}>
                      {line.vendorName ? `${line.vendorName}: ` : ""}
                      {line.name} × {line.quantity}{" "}
                      <ItemSub>
                        ({formatPrice(line.price * line.quantity)})
                      </ItemSub>
                    </ItemLine>
                  ))}
                </ItemsList>
                {order.notes ? (
                  <NotesLine>
                    <strong>{t("noteLabel")}</strong> {order.notes}
                  </NotesLine>
                ) : null}
              </OrderCard>
            );
          })}
        </List>
      ) : null}
    </>
  );
}
