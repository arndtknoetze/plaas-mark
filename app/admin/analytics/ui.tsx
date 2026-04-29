"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Bot, MousePointerClick, Smartphone } from "lucide-react";
import styled from "styled-components";
import {
  Card as BaseCard,
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

type Snapshot = {
  range: { from: string; to: string };
  totals: {
    events: number;
    sessions: number;
    loggedInEvents: number;
    bots: number;
    mobile: number;
    desktop: number;
  };
  series: {
    days: { date: string; events: number; bot: number }[];
  };
  top: {
    paths: { path: string; count: number }[];
    stores: { storeId: string; name: string; count: number }[];
    devices: { name: string; value: number }[];
    locations: {
      locationId: string;
      name: string;
      slug: string | null;
      count: number;
    }[];
    members: {
      memberId: string;
      name: string;
      phone: string | null;
      count: number;
    }[];
  };
  recent: {
    id: string;
    createdAt: string;
    type: string;
    path: string;
    store: { id: string; name: string } | null;
    location: { id: string; name: string; slug: string | null } | null;
    member: { id: string; name: string; phone: string | null } | null;
    deviceType: string;
    isMobile: boolean;
    isBot: boolean;
    browser: string | null;
    os: string | null;
  }[];
  recentPagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

const Panel = styled(BaseCard)`
  padding: 14px;
`;

function PanelCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Panel>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          {icon ? (
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(0,0,0,0.06)",
                flex: "0 0 auto",
              }}
            >
              {icon}
            </div>
          ) : null}
          <div style={{ fontWeight: 980, letterSpacing: "-0.01em" }}>
            {title}
          </div>
        </div>
      </div>
      {children}
    </Panel>
  );
}

export function AnalyticsDashboard({ snapshot }: { snapshot: Snapshot }) {
  const from = new Date(snapshot.range.from);
  const to = new Date(snapshot.range.to);

  return (
    <div>
      <SectionHeader
        title="Analytics"
        subtitle={`${from.toLocaleDateString("en-ZA", { dateStyle: "medium" })} – ${to.toLocaleDateString(
          "en-ZA",
          { dateStyle: "medium" },
        )}`}
      />

      <StatGrid>
        <StatCol>
          <StatCard label="Events" value={snapshot.totals.events} />
        </StatCol>
        <StatCol>
          <StatCard label="Sessions" value={snapshot.totals.sessions} />
        </StatCol>
        <StatCol>
          <StatCard
            label="Logged-in events"
            value={snapshot.totals.loggedInEvents}
          />
        </StatCol>
        <StatCol>
          <StatCard label="Mobile" value={snapshot.totals.mobile} />
        </StatCol>
        <StatCol>
          <StatCard label="Bots" value={snapshot.totals.bots} />
        </StatCol>
      </StatGrid>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gap: 12,
          marginTop: 12,
        }}
      >
        <div style={{ gridColumn: "span 12" }}>
          <PanelCard title="Events over time" icon={<Activity size={18} />}>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={snapshot.series.days}>
                  <CartesianGrid stroke="rgba(0,0,0,0.08)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(0,0,0,0.55)"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="rgba(0,0,0,0.55)" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: 12,
                      color: "rgba(0,0,0,0.92)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="events"
                    stroke="#60a5fa"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="bot"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <PanelCard title="Top pages" icon={<MousePointerClick size={18} />}>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={snapshot.top.paths}>
                  <CartesianGrid stroke="rgba(0,0,0,0.08)" />
                  <XAxis
                    dataKey="path"
                    stroke="rgba(0,0,0,0.55)"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-10}
                    height={55}
                  />
                  <YAxis stroke="rgba(0,0,0,0.55)" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: 12,
                      color: "rgba(0,0,0,0.92)",
                    }}
                  />
                  <Bar dataKey="count" fill="#34d399" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <PanelCard
            title="Top stores (by views)"
            icon={<Smartphone size={18} />}
          >
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={snapshot.top.stores}>
                  <CartesianGrid stroke="rgba(0,0,0,0.08)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(0,0,0,0.55)"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-10}
                    height={55}
                  />
                  <YAxis stroke="rgba(0,0,0,0.55)" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: 12,
                      color: "rgba(0,0,0,0.92)",
                    }}
                  />
                  <Bar dataKey="count" fill="#a78bfa" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <PanelCard
            title="Top locations"
            icon={<MousePointerClick size={18} />}
          >
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={snapshot.top.locations}>
                  <CartesianGrid stroke="rgba(0,0,0,0.08)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(0,0,0,0.55)"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-10}
                    height={55}
                  />
                  <YAxis stroke="rgba(0,0,0,0.55)" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: 12,
                      color: "rgba(0,0,0,0.92)",
                    }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <PanelCard title="Top logged-in users" icon={<Activity size={18} />}>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={snapshot.top.members}>
                  <CartesianGrid stroke="rgba(0,0,0,0.08)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(0,0,0,0.55)"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-10}
                    height={55}
                  />
                  <YAxis stroke="rgba(0,0,0,0.55)" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: 12,
                      color: "rgba(0,0,0,0.92)",
                    }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <PanelCard title="Devices" icon={<Bot size={18} />}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr)",
                gap: 12,
              }}
            >
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        border: "1px solid rgba(0,0,0,0.12)",
                        borderRadius: 12,
                        color: "rgba(0,0,0,0.92)",
                      }}
                    />
                    <Pie
                      data={snapshot.top.devices}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      fill="#60a5fa"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 10,
                }}
              >
                {snapshot.top.devices.map((d) => (
                  <div
                    key={d.name}
                    style={{
                      background: "rgba(0,0,0,0.02)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      borderRadius: 14,
                      padding: 12,
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ color: "rgba(0,0,0,0.60)", fontWeight: 700 }}>
                      {d.name}
                    </div>
                    <div style={{ fontWeight: 950 }}>{d.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </PanelCard>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <PanelCard title="Recent events" icon={<Activity size={18} />}>
            <div
              style={{
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: "0.9rem", color: "rgba(0,0,0,0.66)" }}>
                Showing up to {snapshot.recentPagination.perPage} rows per page
              </div>
              <div style={{ fontWeight: 800, color: "rgba(0,0,0,0.75)" }}>
                Page {snapshot.recentPagination.page} of{" "}
                {snapshot.recentPagination.totalPages} (
                {snapshot.recentPagination.total} total)
              </div>
            </div>
            <TableCard>
              <TableScroll>
                <Table>
                  <thead>
                    <tr>
                      <Th>Time</Th>
                      <Th>Type</Th>
                      <Th>Path</Th>
                      <Th>Store</Th>
                      <Th>Location</Th>
                      <Th>User</Th>
                      <Th>Device</Th>
                      <Th>Bot</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.recent.map((e) => {
                      const when = new Date(e.createdAt);
                      const deviceLabel = [
                        e.isMobile ? "mobile" : "desktop",
                        e.deviceType !== "unknown" ? e.deviceType : null,
                        e.browser,
                        e.os,
                      ]
                        .filter(Boolean)
                        .join(" · ");
                      return (
                        <tr key={e.id}>
                          <Td $strong style={{ whiteSpace: "nowrap" }}>
                            {when.toLocaleString("en-ZA", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </Td>
                          <Td>{e.type}</Td>
                          <Td
                            style={{
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                              fontSize: "0.82rem",
                              maxWidth: 460,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={e.path}
                          >
                            {e.path}
                          </Td>
                          <Td title={e.store?.id ?? ""}>
                            {e.store?.name ?? "—"}
                          </Td>
                          <Td title={e.location?.id ?? ""}>
                            {e.location?.name ?? "—"}
                          </Td>
                          <Td
                            title={e.member?.id ?? ""}
                            style={{ minWidth: 180 }}
                          >
                            {e.member ? (
                              <div style={{ display: "grid", gap: 2 }}>
                                <div style={{ fontWeight: 800 }}>
                                  {e.member.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "rgba(0,0,0,0.6)",
                                  }}
                                >
                                  {e.member.phone ?? "No phone"}
                                </div>
                              </div>
                            ) : (
                              "—"
                            )}
                          </Td>
                          <Td style={{ whiteSpace: "nowrap" }}>
                            {deviceLabel || "—"}
                          </Td>
                          <Td>{e.isBot ? "BOT" : "HUMAN"}</Td>
                        </tr>
                      );
                    })}
                    {snapshot.recent.length === 0 ? (
                      <tr>
                        <Td colSpan={8}>No events in this range.</Td>
                      </tr>
                    ) : null}
                  </tbody>
                </Table>
              </TableScroll>
            </TableCard>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <a
                href={`/admin/analytics?recentPage=${Math.max(1, snapshot.recentPagination.page - 1)}`}
                style={{
                  pointerEvents:
                    snapshot.recentPagination.page > 1 ? "auto" : "none",
                  opacity: snapshot.recentPagination.page > 1 ? 1 : 0.45,
                  minHeight: 36,
                  padding: "0 12px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.12)",
                  textDecoration: "none",
                  fontWeight: 900,
                  color: "inherit",
                  background: "#fff",
                }}
              >
                Previous
              </a>
              <a
                href={`/admin/analytics?recentPage=${Math.min(snapshot.recentPagination.totalPages, snapshot.recentPagination.page + 1)}`}
                style={{
                  pointerEvents:
                    snapshot.recentPagination.page <
                    snapshot.recentPagination.totalPages
                      ? "auto"
                      : "none",
                  opacity:
                    snapshot.recentPagination.page <
                    snapshot.recentPagination.totalPages
                      ? 1
                      : 0.45,
                  minHeight: 36,
                  padding: "0 12px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.12)",
                  textDecoration: "none",
                  fontWeight: 900,
                  color: "inherit",
                  background: "#fff",
                }}
              >
                Next
              </a>
            </div>
          </PanelCard>
        </div>
      </div>
    </div>
  );
}
