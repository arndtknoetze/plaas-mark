import { prisma } from "@/lib/db";
import {
  Card,
  EmptyState,
  SectionHeader,
  StatCard,
  StatCol,
  StatGrid,
  Table,
  TableCard,
  TableScroll,
  Td,
  Th,
} from "@/components/admin/AdminUI";
import styled from "styled-components";

export const dynamic = "force-dynamic";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const Col = styled.div<{ $span?: number }>`
  grid-column: span ${({ $span }) => $span ?? 12};
  min-width: 0;

  @media (max-width: 980px) {
    grid-column: span 12;
  }
`;

function formatPrice(value: number) {
  return `R ${value.toFixed(2).replace(".", ",")}`;
}

export default async function AdminOverviewPage() {
  const [
    storesTotal,
    storesActive,
    productsTotal,
    ordersTotal,
    recentOrders,
    topStores,
  ] = await Promise.all([
    prisma.store.count(),
    prisma.store.count({ where: { isActive: true } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        member: { select: { name: true, phone: true } },
        items: { orderBy: { id: "asc" } },
      },
    }),
    prisma.store.findMany({
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        location: { select: { name: true } },
      },
    }),
  ]);

  const revenueFromRecent = recentOrders.reduce((sum, o) => {
    const orderTotal = o.items.reduce(
      (s, line) => s + Number(line.price) * line.quantity,
      0,
    );
    return sum + orderTotal;
  }, 0);

  return (
    <div>
      <SectionHeader
        title="Overview"
        subtitle="A quick snapshot across orders, stores, and catalogue."
      />

      <StatGrid>
        <StatCol $span={3}>
          <StatCard label="Total Orders" value={ordersTotal} />
        </StatCol>
        <StatCol $span={3}>
          <StatCard label="Active Stores" value={storesActive} />
        </StatCol>
        <StatCol $span={3}>
          <StatCard label="Total Products" value={productsTotal} />
        </StatCol>
        <StatCol $span={3}>
          <StatCard
            label="Revenue (recent)"
            value={formatPrice(revenueFromRecent)}
          />
        </StatCol>
      </StatGrid>

      <Grid>
        <Col $span={8}>
          <SectionHeader
            title="Recent orders"
            subtitle="Latest activity across the marketplace."
          />
          {recentOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              body="Orders will show up here."
            />
          ) : (
            <TableCard>
              <TableScroll>
                <Table>
                  <thead>
                    <tr>
                      <Th>Customer</Th>
                      <Th>Status</Th>
                      <Th>Total</Th>
                      <Th>Created</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => {
                      const total = o.items.reduce(
                        (s, line) => s + Number(line.price) * line.quantity,
                        0,
                      );
                      return (
                        <tr key={o.id}>
                          <Td $strong>
                            {o.member.name}
                            <div
                              style={{
                                marginTop: 2,
                                color: "rgba(0,0,0,0.55)",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                              }}
                            >
                              {o.member.phone}
                            </div>
                          </Td>
                          <Td>{o.status}</Td>
                          <Td>{formatPrice(total)}</Td>
                          <Td>
                            {o.createdAt.toLocaleString("en-ZA", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableScroll>
            </TableCard>
          )}
        </Col>

        <Col $span={4}>
          <SectionHeader
            title="Top stores"
            subtitle={`${storesTotal} stores total`}
          />
          <Card>
            <div style={{ display: "grid", gap: 10 }}>
              {topStores.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 12,
                    paddingBottom: 10,
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 950, lineHeight: 1.2 }}>
                      {s.name}
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        color: "rgba(0,0,0,0.55)",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {s.location.name} · {s.slug}
                    </div>
                  </div>
                  <div
                    style={{
                      flexShrink: 0,
                      fontWeight: 950,
                      color: s.isActive ? "#166534" : "#991b1b",
                    }}
                  >
                    {s.isActive ? "ACTIVE" : "INACTIVE"}
                  </div>
                </div>
              ))}
              {topStores.length === 0 ? (
                <div style={{ color: "rgba(0,0,0,0.55)" }}>No stores yet.</div>
              ) : null}
            </div>
          </Card>
        </Col>
      </Grid>
    </div>
  );
}
