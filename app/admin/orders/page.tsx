import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  buildWhatsAppUrl,
  DEFAULT_WHATSAPP_ORDER_MESSAGE,
} from "@/lib/whatsapp-link";
import { Card, EmptyState, SectionHeader } from "@/components/admin/AdminUI";
import styled from "styled-components";

export const dynamic = "force-dynamic";

function formatPrice(value: number) {
  return `R ${value.toFixed(2).replace(".", ",")}`;
}

function formatWhen(d: Date) {
  return d.toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const OrderList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(46, 94, 62, 0.12);
  border: 1px solid rgba(46, 94, 62, 0.18);
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 950;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const WhatsAppBtn = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 950;
  color: #ffffff;
  background: #25d366;
  text-decoration: none;
`;

export default async function AdminOrdersPage() {
  if (process.env.ADMIN_ROUTES_ENABLED !== "true") {
    notFound();
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      member: { select: { name: true, phone: true, email: true } },
      items: { orderBy: { id: "asc" } },
    },
  });

  return (
    <div>
      <SectionHeader
        title="Orders"
        subtitle="Latest orders and customer contact shortcuts."
      />

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          body="Orders will show up here once placed."
        />
      ) : (
        <OrderList>
          {orders.map((order) => {
            const total = order.items.reduce(
              (sum, line) => sum + Number(line.price) * line.quantity,
              0,
            );
            const contactPhone = order.member.phone?.trim() ?? "";
            const whatsappHref = contactPhone
              ? buildWhatsAppUrl(contactPhone, DEFAULT_WHATSAPP_ORDER_MESSAGE)
              : null;
            return (
              <li key={order.id}>
                <Card>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                      paddingBottom: 12,
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 980 }}>{order.member.name}</div>
                      <div
                        style={{
                          marginTop: 2,
                          color: "rgba(0,0,0,0.55)",
                          fontWeight: 700,
                        }}
                      >
                        {order.member.email ?? order.member.phone ?? "—"}
                      </div>
                      {whatsappHref ? (
                        <WhatsAppBtn
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp kliënt
                        </WhatsAppBtn>
                      ) : null}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Pill>{order.status}</Pill>
                      <div
                        style={{
                          marginTop: 8,
                          color: "rgba(0,0,0,0.55)",
                          fontWeight: 700,
                        }}
                      >
                        {formatWhen(order.createdAt)}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: "0.75rem",
                          color: "rgba(0,0,0,0.45)",
                          wordBreak: "break-all",
                          maxWidth: 280,
                        }}
                      >
                        {order.id}
                      </div>
                    </div>
                  </div>

                  {order.notes ? (
                    <div
                      style={{
                        marginBottom: 12,
                        color: "rgba(0,0,0,0.75)",
                        lineHeight: 1.55,
                      }}
                    >
                      <strong>Notes:</strong> {order.notes}
                    </div>
                  ) : null}

                  <div style={{ display: "grid", gap: 8 }}>
                    {order.items.map((line) => (
                      <div
                        key={line.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 12,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 900 }}>{line.name}</div>
                          {line.vendorName ? (
                            <div
                              style={{
                                marginTop: 2,
                                fontSize: "0.85rem",
                                color: "rgba(0,0,0,0.55)",
                                fontWeight: 700,
                              }}
                            >
                              {line.vendorName}
                            </div>
                          ) : null}
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: "0.85rem",
                              color: "rgba(0,0,0,0.55)",
                              fontWeight: 700,
                            }}
                          >
                            {formatPrice(Number(line.price))} × {line.quantity}
                          </div>
                        </div>
                        <div style={{ fontWeight: 980, flexShrink: 0 }}>
                          {formatPrice(Number(line.price) * line.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                      textAlign: "right",
                      fontWeight: 980,
                    }}
                  >
                    Total: {formatPrice(total)}
                  </div>
                </Card>
              </li>
            );
          })}
        </OrderList>
      )}
    </div>
  );
}
