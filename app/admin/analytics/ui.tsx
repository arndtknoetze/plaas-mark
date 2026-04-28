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
  };
  recent: {
    id: string;
    createdAt: string;
    type: string;
    path: string;
    store: { id: string; name: string } | null;
    deviceType: string;
    isMobile: boolean;
    isBot: boolean;
    browser: string | null;
    os: string | null;
  }[];
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
            <TableCard>
              <TableScroll>
                <Table>
                  <thead>
                    <tr>
                      <Th>Time</Th>
                      <Th>Type</Th>
                      <Th>Path</Th>
                      <Th>Store</Th>
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
                          <Td style={{ whiteSpace: "nowrap" }}>
                            {deviceLabel || "—"}
                          </Td>
                          <Td>{e.isBot ? "BOT" : "HUMAN"}</Td>
                        </tr>
                      );
                    })}
                    {snapshot.recent.length === 0 ? (
                      <tr>
                        <Td colSpan={6}>No events in this range.</Td>
                      </tr>
                    ) : null}
                  </tbody>
                </Table>
              </TableScroll>
            </TableCard>
          </PanelCard>
        </div>
      </div>
    </div>
  );
}
