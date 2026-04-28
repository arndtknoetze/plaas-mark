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

export default async function AdminStoresPage() {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      createdAt: true,
      member: { select: { name: true, phone: true } },
      location: { select: { name: true, slug: true } },
    },
  });

  return (
    <div>
      <SectionHeader
        title="Stores"
        subtitle="All stores, their owners, and activation state."
      />

      {stores.length === 0 ? (
        <EmptyState
          title="No stores yet"
          body="Once stores are created, they’ll show up here."
        />
      ) : (
        <TableCard>
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <Th>Store</Th>
                  <Th>Owner</Th>
                  <Th>Location</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.id}>
                    <Td $strong>
                      {s.name}
                      <div
                        style={{
                          marginTop: 2,
                          color: "rgba(0,0,0,0.55)",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        {s.slug} · {s.id}
                      </div>
                    </Td>
                    <Td>
                      <div style={{ fontWeight: 900 }}>{s.member.name}</div>
                      <div
                        style={{ color: "rgba(0,0,0,0.55)", fontWeight: 700 }}
                      >
                        {s.member.phone}
                      </div>
                    </Td>
                    <Td>
                      {s.location.name}{" "}
                      <span style={{ color: "rgba(0,0,0,0.55)" }}>
                        ({s.location.slug})
                      </span>
                    </Td>
                    <Td>{s.isActive ? "ACTIVE" : "INACTIVE"}</Td>
                    <Td>
                      {s.createdAt.toLocaleDateString("en-ZA", {
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
