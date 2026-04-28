"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Container } from "@/components/Container";
import { loadStoredSession } from "@/lib/session-storage";
import { useLanguage } from "@/lib/useLanguage";
import type { ActivityItem } from "@/types/activity";
import type { Language } from "@/lib/i18n";

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type TimeBucket = "today" | "yesterday" | "earlier";

function getTimeBucket(iso: string): TimeBucket {
  const event = new Date(iso);
  const now = new Date();
  const eventKey = localDateKey(event);
  if (eventKey === localDateKey(now)) return "today";
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (eventKey === localDateKey(y)) return "yesterday";
  return "earlier";
}

function localeForLanguage(language: Language): string {
  return language === "en" ? "en-ZA" : "af-ZA";
}

function formatTimestamp(
  iso: string,
  bucket: TimeBucket,
  language: Language,
): string {
  const d = new Date(iso);
  const locale = localeForLanguage(language);
  const time = d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (bucket === "today" || bucket === "yesterday") return time;
  return (
    d.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
    }) +
    " · " +
    time
  );
}

function iconForItem(item: ActivityItem): string {
  switch (item.type) {
    case "order_customer":
      return "🛒";
    case "order_seller":
      return "🏪";
    case "notification":
      return "🔔";
  }
}

const PageWrap = styled.div`
  padding: 20px 0 40px;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 14px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Lead = styled.p`
  margin: 0 0 20px;
  font-size: 0.9375rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Hint = styled.p`
  margin: 0 0 16px;
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.05);
`;

const HintLink = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    text-decoration: underline;
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 10px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textLight};
`;

const SectionBlock = styled.section`
  margin-bottom: 22px;
`;

const ItemRow = styled.div<{ $unread?: boolean }>`
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 14px;
  margin-bottom: 8px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: ${({ $unread, theme }) =>
    $unread ? `3px solid ${theme.colors.accent}` : "3px solid transparent"};
`;

const IconCircle = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 1.35rem;
  line-height: 1;
  background: #eef3ef;
  flex-shrink: 0;
`;

const ItemBody = styled.div`
  min-width: 0;
`;

const ItemTitle = styled.div<{ $strong?: boolean }>`
  font-weight: ${({ $strong }) => ($strong !== false ? 700 : 600)};
  font-size: 0.95rem;
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.textDark};
`;

const ItemSubtitle = styled.div`
  margin-top: 4px;
  font-size: 0.8125rem;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.textLight};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ItemTime = styled.time`
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
  white-space: nowrap;
  padding-top: 2px;
`;

const EmptyState = styled.p`
  margin: 0;
  padding: 16px;
  border-radius: 10px;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.textLight};
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ErrorMsg = styled.p`
  margin: 0 0 16px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #8a1c1c;
  background: #fdeaea;
  border: 1px solid #f0c4c4;
`;

const ReloadBtn = styled.button`
  margin-top: 12px;
  width: 100%;
  min-height: 48px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

function groupActivity(
  rows: ActivityItem[],
): Record<TimeBucket, ActivityItem[]> {
  const out: Record<TimeBucket, ActivityItem[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  };
  for (const row of rows) {
    const b = getTimeBucket(row.createdAt);
    out[b].push(row);
  }
  return out;
}

export function ActivityPageClient() {
  const { t, language } = useLanguage();
  const [sessionPhone, setSessionPhone] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const s = loadStoredSession();
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate localStorage-backed session */
    setSessionPhone(s?.phone ?? null);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const load = useCallback(async () => {
    if (!sessionPhone) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/activity?phone=${encodeURIComponent(sessionPhone)}`,
        { cache: "no-store" },
      );
      const data = (await res.json().catch(() => ({}))) as {
        activity?: ActivityItem[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? t("errLoadActivity"));
        setActivity([]);
        return;
      }
      setActivity(Array.isArray(data.activity) ? data.activity : []);
    } catch {
      setError(t("errLoadActivity"));
      setActivity([]);
    } finally {
      setLoading(false);
    }
  }, [sessionPhone, t]);

  useEffect(() => {
    if (!sessionPhone) return;
    /* eslint-disable react-hooks/set-state-in-effect -- load() manages state internally */
    void load();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [sessionPhone, load]);

  useEffect(() => {
    if (!sessionPhone) return;
    fetch("/api/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: sessionPhone }),
    }).catch(() => {});
  }, [sessionPhone]);

  const grouped = useMemo(() => groupActivity(activity), [activity]);

  const sections: { bucket: TimeBucket; label: string }[] = useMemo(
    () => [
      { bucket: "today", label: t("today") },
      { bucket: "yesterday", label: t("yesterday") },
    ],
    [t],
  );

  if (!hydrated) {
    return (
      <Container>
        <PageWrap>
          <p style={{ margin: 0 }}>{t("loading")}</p>
        </PageWrap>
      </Container>
    );
  }

  if (!sessionPhone) {
    return (
      <Container>
        <PageWrap>
          <BackLink href="/shop">{t("backToShop")}</BackLink>
          <Title>{t("activity")}</Title>
          <Hint>
            {t("activitySignInPrompt")}{" "}
            <HintLink href="/login">{t("signIn")}</HintLink>
          </Hint>
        </PageWrap>
      </Container>
    );
  }

  return (
    <Container>
      <PageWrap>
        <BackLink href="/shop">{t("backToShop")}</BackLink>
        <Title>{t("activity")}</Title>
        <Lead>{t("activityLead")}</Lead>

        {error ? <ErrorMsg>{error}</ErrorMsg> : null}

        {loading && activity.length === 0 ? (
          <EmptyState>{t("loading")}</EmptyState>
        ) : null}

        {!loading || activity.length > 0 ? (
          <>
            {sections.map(({ bucket, label }) => {
              const rows = grouped[bucket];
              if (!rows?.length) return null;
              return (
                <SectionBlock key={bucket}>
                  <SectionTitle>{label}</SectionTitle>
                  {rows.map((row) => {
                    const ts = formatTimestamp(row.createdAt, bucket, language);
                    const key = `${row.type}-${row.id}-${row.createdAt}`;
                    return (
                      <ItemRow key={key}>
                        <IconCircle aria-hidden>{iconForItem(row)}</IconCircle>
                        <ItemBody>
                          <ItemTitle $strong>{row.title}</ItemTitle>
                          <ItemSubtitle>{row.subtitle}</ItemSubtitle>
                        </ItemBody>
                        <ItemTime dateTime={row.createdAt}>{ts}</ItemTime>
                      </ItemRow>
                    );
                  })}
                </SectionBlock>
              );
            })}

            {!loading && activity.length === 0 && !error ? (
              <EmptyState>{t("emptyActivity")}</EmptyState>
            ) : null}
          </>
        ) : null}

        <ReloadBtn type="button" onClick={() => void load()} disabled={loading}>
          {loading ? t("loading") : t("refresh")}
        </ReloadBtn>
      </PageWrap>
    </Container>
  );
}
