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

export default async function AdminMembersPage() {
  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, name: true, phone: true, role: true, createdAt: true },
  });

  return (
    <div>
      <SectionHeader
        title="Members"
        subtitle="Admin users and marketplace members."
      />

      {members.length === 0 ? (
        <EmptyState
          title="No members yet"
          body="Once members sign up, they’ll appear here."
        />
      ) : (
        <TableCard>
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Phone</Th>
                  <Th>Role</Th>
                  <Th>Created</Th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <Td $strong>{m.name}</Td>
                    <Td>{m.phone}</Td>
                    <Td>{m.role}</Td>
                    <Td>
                      {m.createdAt.toLocaleDateString("en-ZA", {
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
