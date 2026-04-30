"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { useLanguage } from "@/lib/useLanguage";
import {
  buildWhatsAppUrl,
  DEFAULT_WHATSAPP_ORDER_MESSAGE,
} from "@/lib/whatsapp-link";
import { loadStoredSession } from "@/lib/session-storage";

type StoreOrderItemRow = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  vendorId: string;
  vendorName: string;
};

type StoreOrderRow = {
  id: string;
  createdAt: string;
  status: string;
  notes: string | null;
  customerName: string;
  customerPhone: string;
  items: StoreOrderItemRow[];
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

const Hint = styled.p`
  margin: 0 0 16px;
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.05);
`;

const HintLink = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    text-decoration: underline;
  }
`;

const ReloadBtn = styled.button`
  margin-top: 12px;
  width: 100%;
  min-height: 48px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;

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

const OrderCard = styled.article`
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.05);
`;

const CustomerBlock = styled.div`
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ecece8;
`;

const CustomerName = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textDark};
`;

const CustomerPhone = styled.div`
  margin-top: 4px;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const WhatsAppAction = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 44px;
  margin-top: 10px;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 700;
  text-decoration: none;
  color: #ffffff;
  background: #25d366;
  box-sizing: border-box;
  transition: background 0.15s ease;

  &:hover {
    background: #1ebe57;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const OrderMeta = styled.p`
  margin: 0 0 6px;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const OrderNotes = styled.p`
  margin: 10px 0 0;
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

const StatusField = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StatusLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textLight};
`;

const StatusBadge = styled.span`
  display: inline-block;
  margin-top: 4px;
  font-size: 0.9375rem;
  font-weight: 700;
  text-transform: capitalize;
  color: ${({ theme }) => theme.colors.primary};
`;

const StatusButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const StatusBtn = styled.button<{ $active: boolean }>`
  flex: 1 1 calc(33.333% - 6px);
  min-width: min(100%, 104px);
  min-height: 44px;
  padding: 0 10px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : "#d8d8d4")};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary : "#ffffff"};
  color: ${({ $active }) => ($active ? "#ffffff" : "#1a1a1a")};
  transition:
    background 0.12s ease,
    border-color 0.12s ease,
    opacity 0.12s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme, $active }) =>
      $active ? theme.colors.secondary : `${theme.colors.background}`};
  }

  &:disabled {
    opacity: 0.5;
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

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function isStoreOrderItemRow(value: unknown): value is StoreOrderItemRow {
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

function isStoreOrderRow(value: unknown): value is StoreOrderRow {
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
  if (
    typeof o.customerName !== "string" ||
    typeof o.customerPhone !== "string"
  ) {
    return false;
  }
  if (!Array.isArray(o.items) || !o.items.every(isStoreOrderItemRow)) {
    return false;
  }
  return true;
}

function parseResponse(data: unknown): StoreOrderRow[] | null {
  if (!data || typeof data !== "object") return null;
  const orders = (data as { orders?: unknown }).orders;
  if (!Array.isArray(orders) || !orders.every(isStoreOrderRow)) return null;
  return orders;
}

export default function AccountStoreOrdersPage() {
  const { t } = useLanguage();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<StoreOrderRow[] | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setError(null);
    setLoading(true);
    setOrders(null);
    try {
      const res = await fetch("/api/account/store-orders");
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
      const parsed = parseResponse(data);
      if (!parsed) throw new Error("Invalid response from server.");
      setOrders(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  const patchOrderStatusOptimistic = useCallback(
    async (orderId: string, nextStatus: string) => {
      if (!loadStoredSession()) return;
      setStatusError(null);

      let previousStatus = "";
      setOrders((prev) => {
        if (!prev) return prev;
        const cur = prev.find((o) => o.id === orderId);
        previousStatus = cur?.status ?? "";
        return prev.map((o) =>
          o.id === orderId ? { ...o, status: nextStatus } : o,
        );
      });

      setUpdatingId(orderId);
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        const data: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof (data as { error: unknown }).error === "string"
              ? (data as { error: string }).error
              : "Could not update status.";
          throw new Error(msg);
        }
        if (
          data &&
          typeof data === "object" &&
          "status" in data &&
          typeof (data as { status: unknown }).status === "string"
        ) {
          const s = (data as { status: string }).status;
          setOrders((prev) =>
            prev
              ? prev.map((o) => (o.id === orderId ? { ...o, status: s } : o))
              : null,
          );
        }
      } catch (err) {
        setOrders((prev) =>
          prev
            ? prev.map((o) =>
                o.id === orderId ? { ...o, status: previousStatus } : o,
              )
            : null,
        );
        setStatusError(
          err instanceof Error ? err.message : "Could not update status.",
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [],
  );

  useEffect(() => {
    const session = loadStoredSession();
    const ok = Boolean(session?.email?.trim() || session?.phone?.trim());
    queueMicrotask(() => {
      setSignedIn(ok);
      setBootstrapped(true);
      if (ok) {
        void fetchOrders();
      }
    });
  }, [fetchOrders]);

  if (!bootstrapped) {
    return (
      <>
        <BackLink href="/account">Back to dashboard</BackLink>
        <Title>{t("myStoreOrdersTitle")}</Title>
        <Hint>{t("loading")}</Hint>
      </>
    );
  }

  if (!signedIn) {
    return (
      <>
        <BackLink href="/account">Back to dashboard</BackLink>
        <Title>{t("myStoreOrdersTitle")}</Title>
        <Subtitle>{t("myStoreOrdersSubtitleSignedOut")}</Subtitle>
        <Hint>
          {t("signInToSeeStoreOrders")}{" "}
          <HintLink href="/account">{t("account")}</HintLink>
        </Hint>
      </>
    );
  }

  return (
    <>
      <BackLink href="/account">Back to dashboard</BackLink>
      <Title>{t("myStoreOrdersTitle")}</Title>
      <Subtitle>{t("myStoreOrdersSubtitleSignedIn")}</Subtitle>

      {loading ? <Hint>{t("loading")}</Hint> : null}

      {!loading ? (
        <ReloadBtn
          type="button"
          onClick={() => {
            if (loadStoredSession()) void fetchOrders();
          }}
        >
          {t("refreshBtn")}
        </ReloadBtn>
      ) : null}

      {error ? <ErrorMsg role="alert">{error}</ErrorMsg> : null}

      {statusError ? <ErrorMsg role="alert">{statusError}</ErrorMsg> : null}

      {!loading && orders && orders.length === 0 ? (
        <EmptyHint>{t("noStoreOrdersYet")}</EmptyHint>
      ) : null}

      {!loading && orders && orders.length > 0
        ? orders.map((order) => {
            const total = order.items.reduce(
              (sum, line) => sum + line.price * line.quantity,
              0,
            );
            const whatsappHref = buildWhatsAppUrl(
              order.customerPhone,
              DEFAULT_WHATSAPP_ORDER_MESSAGE,
            );
            return (
              <OrderCard key={order.id}>
                <CustomerBlock>
                  <CustomerName>{order.customerName}</CustomerName>
                  <CustomerPhone>{order.customerPhone}</CustomerPhone>
                  {whatsappHref ? (
                    <WhatsAppAction
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("whatsappCustomer")}
                    </WhatsAppAction>
                  ) : null}
                  <OrderMeta>{formatWhen(order.createdAt)}</OrderMeta>
                  <StatusField>
                    <StatusLabel>{t("orderStatusLabel")}</StatusLabel>
                    <StatusBadge>{order.status}</StatusBadge>
                    <StatusButtonRow>
                      <StatusBtn
                        type="button"
                        $active={order.status === "accepted"}
                        disabled={updatingId === order.id}
                        onClick={() => {
                          void patchOrderStatusOptimistic(order.id, "accepted");
                        }}
                      >
                        {t("accept")}
                      </StatusBtn>
                      <StatusBtn
                        type="button"
                        $active={order.status === "ready"}
                        disabled={updatingId === order.id}
                        onClick={() => {
                          void patchOrderStatusOptimistic(order.id, "ready");
                        }}
                      >
                        {t("ready")}
                      </StatusBtn>
                      <StatusBtn
                        type="button"
                        $active={order.status === "completed"}
                        disabled={updatingId === order.id}
                        onClick={() => {
                          void patchOrderStatusOptimistic(
                            order.id,
                            "completed",
                          );
                        }}
                      >
                        {t("complete")}
                      </StatusBtn>
                    </StatusButtonRow>
                  </StatusField>
                  {order.notes ? (
                    <OrderNotes>
                      <strong>{t("notesLabelEn")}</strong> {order.notes}
                    </OrderNotes>
                  ) : null}
                </CustomerBlock>
                <ItemList>
                  {order.items.map((line) => (
                    <ItemRow key={line.id}>
                      <ItemMain>
                        <ItemName>{line.name}</ItemName>
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
                <OrderTotal>
                  {t("subtotalYourItems", { amount: formatPrice(total) })}
                </OrderTotal>
              </OrderCard>
            );
          })
        : null}
    </>
  );
}
