import { prisma } from "@/lib/db";
import {
  EmptyState,
  SectionHeader,
  Table,
  TableCard,
  TableScroll,
  Td,
  Th,
} from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

function formatPrice(value: number) {
  return `R ${value.toFixed(2).replace(".", ",")}`;
}

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      title: true,
      price: true,
      unit: true,
      vendorName: true,
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          member: { select: { phone: true } },
        },
      },
      updatedAt: true,
    },
  });

  return (
    <div>
      <SectionHeader
        title="Products"
        subtitle="Catalogue view across stores and vendors."
      />

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          body="Products will show up here once created."
        />
      ) : (
        <TableCard>
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Store</Th>
                  <Th>Price</Th>
                  <Th>Updated</Th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <Td $strong>
                      {p.title}
                      <div
                        style={{
                          marginTop: 2,
                          color: "rgba(0,0,0,0.55)",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        {p.id}
                      </div>
                    </Td>
                    <Td>
                      <div style={{ fontWeight: 900 }}>
                        {p.store?.name ?? p.vendorName}
                      </div>
                      {p.store ? (
                        <div
                          style={{ color: "rgba(0,0,0,0.55)", fontWeight: 700 }}
                        >
                          {p.store.slug} · {p.store.member.phone}
                        </div>
                      ) : null}
                    </Td>
                    <Td>
                      <span style={{ fontWeight: 900 }}>
                        {formatPrice(Number(p.price))}
                      </span>
                      {p.unit ? (
                        <span
                          style={{ color: "rgba(0,0,0,0.55)", fontWeight: 700 }}
                        >
                          {" "}
                          / {p.unit}
                        </span>
                      ) : null}
                    </Td>
                    <Td>
                      {p.updatedAt.toLocaleDateString("en-ZA", {
                        dateStyle: "medium",
                      })}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        </TableCard>
      )}
    </div>
  );
}
