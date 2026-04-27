import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

const colors = {
  text: "#1A1A1A",
  muted: "#6B6B6B",
  primary: "#2E5E3E",
  cardBg: "#ffffff",
  border: "#ecece8",
};

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

export default async function AdminOrdersPage() {
  if (process.env.ADMIN_ROUTES_ENABLED !== "true") {
    notFound();
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      member: { select: { name: true, phone: true } },
      items: { orderBy: { id: "asc" } },
    },
  });

  return (
    <div
      style={{
        maxWidth: 880,
        margin: "0 auto",
        color: colors.text,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: colors.primary,
        }}
      >
        Temporary / dev
      </p>
      <h1
        style={{
          margin: "0 0 8px",
          fontSize: "1.5rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        Latest orders
      </h1>
      <p
        style={{ margin: "0 0 24px", fontSize: "0.9rem", color: colors.muted }}
      >
        Last 50 orders. Enable with{" "}
        <code style={{ fontSize: "0.85em" }}>ADMIN_ROUTES_ENABLED=true</code>.
        No authentication — do not expose in production.
      </p>

      {orders.length === 0 ? (
        <p style={{ color: colors.muted }}>No orders yet.</p>
      ) : (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {orders.map((order) => {
            const total = order.items.reduce(
              (sum, line) => sum + Number(line.price) * line.quantity,
              0,
            );
            return (
              <li
                key={order.id}
                style={{
                  background: colors.cardBg,
                  borderRadius: 12,
                  padding: "16px 18px",
                  boxShadow:
                    "0 1px 0 rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 12,
                    paddingBottom: 12,
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      {order.member.name}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: colors.muted }}>
                      {order.member.phone}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.8rem", color: colors.muted }}>
                      {formatWhen(order.createdAt)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: colors.muted,
                        wordBreak: "break-all",
                        maxWidth: 260,
                      }}
                    >
                      {order.id}
                    </div>
                  </div>
                </div>

                {order.notes ? (
                  <p
                    style={{
                      margin: "0 0 12px",
                      fontSize: "0.875rem",
                      color: colors.text,
                    }}
                  >
                    <strong>Notes:</strong> {order.notes}
                  </p>
                ) : null}

                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {order.items.map((line) => (
                    <li
                      key={line.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        fontSize: "0.9rem",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600 }}>{line.name}</div>
                        {line.vendorName ? (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: colors.muted,
                              marginTop: 2,
                            }}
                          >
                            {line.vendorName}
                          </div>
                        ) : null}
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: colors.muted,
                            marginTop: 4,
                          }}
                        >
                          {formatPrice(Number(line.price))} × {line.quantity}
                        </div>
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: colors.primary,
                          flexShrink: 0,
                        }}
                      >
                        {formatPrice(Number(line.price) * line.quantity)}
                      </div>
                    </li>
                  ))}
                </ul>
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: `1px solid ${colors.border}`,
                    textAlign: "right",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                >
                  Total: {formatPrice(total)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
