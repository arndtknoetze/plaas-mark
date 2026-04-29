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

export default async function AdminWaitlistPage() {
  const signups = await prisma.waitlistSignup.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      email: true,
      source: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <SectionHeader
        title="Waitlist Signups"
        subtitle="Recent email signups for product launch notifications."
      />

      {signups.length === 0 ? (
        <EmptyState
          title="No waitlist signups yet"
          body="Signups will appear here once users join the waitlist."
        />
      ) : (
        <TableCard>
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <Th>Email</Th>
                  <Th>Source</Th>
                  <Th>Created</Th>
                </tr>
              </thead>
              <tbody>
                {signups.map((signup) => (
                  <tr key={signup.id}>
                    <Td $strong>{signup.email}</Td>
                    <Td>{signup.source ?? "—"}</Td>
                    <Td>
                      {signup.createdAt.toLocaleString("en-ZA", {
                        dateStyle: "medium",
                        timeStyle: "short",
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
