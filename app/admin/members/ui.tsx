"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import {
  EmptyState,
  SecondaryButton,
  SectionHeader,
  Table,
  TableCard,
  TableScroll,
  Td,
  Th,
} from "@/components/admin/AdminUI";

export type AdminMemberRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
  counts: { stores: number; orders: number };
};

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Search = styled.input`
  flex: 1 1 320px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: #ffffff;
  font-weight: 750;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.04);
  }
`;

const Select = styled.select`
  min-height: 38px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: #ffffff;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Pill = styled.span<{ $tone?: "good" | "neutral" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-weight: 950;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ $tone, theme }) =>
    $tone === "good" ? theme.colors.primary : theme.colors.textDark};
  background: ${({ $tone, theme }) =>
    $tone === "good" ? theme.colors.background : "rgba(255,255,255,0.8)"};
  border: 1px solid
    ${({ $tone }) =>
      $tone === "good" ? "rgba(46, 94, 62, 0.25)" : "rgba(0,0,0,0.1)"};
`;

const Danger = styled.button`
  min-height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(153, 27, 27, 0.25);
  background: rgba(255, 235, 235, 0.8);
  color: rgba(153, 27, 27, 0.95);
  font-weight: 950;
  cursor: pointer;

  &:hover {
    background: rgba(255, 225, 225, 0.9);
  }
`;

async function apiJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data
        ? String((data as { error?: unknown }).error ?? "Failed.")
        : "Failed.";
    throw new Error(msg);
  }
  return data;
}

export function AdminMembersClient({ initial }: { initial: AdminMemberRow[] }) {
  const [rows, setRows] = useState<AdminMemberRow[]>(initial);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"ALL" | "ADMIN" | "MEMBER">("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((m) => {
      if (role !== "ALL" && m.role !== role) return false;
      if (!query) return true;
      return (
        m.name.toLowerCase().includes(query) ||
        (m.email?.toLowerCase().includes(query) ?? false) ||
        (m.phone?.toLowerCase().includes(query) ?? false) ||
        m.id.toLowerCase().includes(query)
      );
    });
  }, [rows, q, role]);

  async function refresh() {
    setError(null);
    try {
      const data = await apiJson<{
        members: Array<{
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          role: "ADMIN" | "MEMBER";
          createdAt: string;
          _count: { stores: number; orders: number };
        }>;
      }>("/api/admin/members", { method: "GET" });
      setRows(
        data.members.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          role: m.role,
          createdAt: m.createdAt,
          counts: { stores: m._count.stores, orders: m._count.orders },
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    }
  }

  async function setMemberRole(memberId: string, nextRole: "ADMIN" | "MEMBER") {
    setBusyId(memberId);
    setError(null);
    try {
      await apiJson<{ ok: true }>("/api/admin/members", {
        method: "PATCH",
        body: JSON.stringify({ memberId, role: nextRole }),
      });
      setRows((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: nextRole } : m)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteMember(memberId: string) {
    const target = rows.find((r) => r.id === memberId);
    const name = target?.name ?? "this member";
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;

    setBusyId(memberId);
    setError(null);
    try {
      await apiJson<{ ok: true }>("/api/admin/members", {
        method: "DELETE",
        body: JSON.stringify({ memberId }),
      });
      setRows((prev) => prev.filter((m) => m.id !== memberId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <SectionHeader
        title="Members"
        subtitle="Admin users and marketplace members."
      />

      <Controls>
        <Search
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name / email / phone / id…"
          aria-label="Search members"
        />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Select
            value={role}
            onChange={(e) =>
              setRole(e.target.value as "ALL" | "ADMIN" | "MEMBER")
            }
            aria-label="Filter role"
          >
            <option value="ALL">All roles</option>
            <option value="ADMIN">Admins</option>
            <option value="MEMBER">Members</option>
          </Select>
          <SecondaryButton type="button" onClick={refresh}>
            Refresh
          </SecondaryButton>
        </div>
      </Controls>

      {error ? (
        <div
          role="alert"
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(153, 27, 27, 0.25)",
            background: "rgba(255, 235, 235, 0.8)",
            fontWeight: 850,
          }}
        >
          {error}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState title="No members found" body="Try a different search." />
      ) : (
        <TableCard>
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Role</Th>
                  <Th>Stores</Th>
                  <Th>Orders</Th>
                  <Th>Created</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const isBusy = busyId === m.id;
                  return (
                    <tr key={m.id}>
                      <Td $strong>
                        {m.name}
                        <div
                          style={{
                            marginTop: 2,
                            color: "rgba(0,0,0,0.55)",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                          }}
                        >
                          {m.id}
                        </div>
                      </Td>
                      <Td>{m.email ?? "—"}</Td>
                      <Td>{m.phone ?? "—"}</Td>
                      <Td>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                          }}
                        >
                          <Pill $tone={m.role === "ADMIN" ? "good" : "neutral"}>
                            {m.role}
                          </Pill>
                          <Select
                            value={m.role}
                            disabled={isBusy}
                            onChange={(e) =>
                              setMemberRole(
                                m.id,
                                e.target.value as "ADMIN" | "MEMBER",
                              )
                            }
                            aria-label={`Change role for ${m.name}`}
                          >
                            <option value="MEMBER">MEMBER</option>
                            <option value="ADMIN">ADMIN</option>
                          </Select>
                        </div>
                      </Td>
                      <Td>{m.counts.stores}</Td>
                      <Td>{m.counts.orders}</Td>
                      <Td>
                        {new Date(m.createdAt).toLocaleDateString("en-ZA", {
                          dateStyle: "medium",
                        })}
                      </Td>
                      <Td>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <Danger
                            type="button"
                            disabled={isBusy}
                            onClick={() => deleteMember(m.id)}
                          >
                            Delete
                          </Danger>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableScroll>
        </TableCard>
      )}
    </div>
  );
}
