"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/useLanguage";

const DISMISS_KEY = "plaasmark-beta-modal-dismissed-v1";

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 14px;

  @media (min-width: 640px) {
    align-items: center;
    padding: 18px;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 520px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.18),
    0 1px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const Top = styled.div`
  padding: 18px 18px 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 6px 10px;
  border-radius: 999px;
`;

const Title = styled.h2`
  margin: 10px 0 0;
  font-size: 1.2rem;
  line-height: 1.2;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Body = styled.div`
  padding: 0 18px 18px;
`;

const Copy = styled.p`
  margin: 10px 0 0;
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.5;
  font-size: 0.95rem;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 14px 0;
`;

const Form = styled.form`
  display: flex;
  gap: 10px;
  align-items: stretch;
  flex-direction: column;

  @media (min-width: 460px) {
    flex-direction: row;
  }
`;

const Email = styled.input`
  flex: 1 1 auto;
  min-height: 46px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: #ffffff;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textDark};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.04);
  }
`;

const Primary = styled.button`
  flex: 0 0 auto;
  min-height: 46px;
  padding: 0 14px;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.05s ease,
    opacity 0.15s ease;

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const SecondaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
`;

const Secondary = styled.button`
  min-height: 44px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #ffffff;
  color: ${({ theme }) => theme.colors.textDark};
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Close = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textLight};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textDark};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const FinePrint = styled.p`
  margin: 10px 0 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.45;
`;

const Message = styled.div<{ $tone: "good" | "bad" }>`
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ $tone, theme }) =>
    $tone === "good" ? theme.colors.primary : theme.colors.textDark};
  background: ${({ $tone, theme }) =>
    $tone === "good" ? theme.colors.background : "#fff5f5"};
  border: 1px solid
    ${({ $tone }) => ($tone === "good" ? "rgba(0,0,0,0.06)" : "#ffd6d6")};
`;

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

type ApiState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

export function BetaWelcomeModal() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [api, setApi] = useState<ApiState>({ status: "idle" });
  const firstFocusRef = useRef<HTMLInputElement | null>(null);

  const shouldConsiderShowing = pathname === "/";

  useEffect(() => {
    if (!shouldConsiderShowing) return;
    const id = window.setTimeout(() => {
      try {
        const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
        setOpen(!dismissed);
      } catch {
        setOpen(true);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [shouldConsiderShowing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    const id = window.setTimeout(() => firstFocusRef.current?.focus(), 50);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
    };
  }, [open]);

  const strings = useMemo(() => {
    return {
      badge: t("betaBadge"),
      title: t("betaTitle"),
      body: t("betaBody"),
      emailLabel: t("notifyEmailLabel"),
      emailPlaceholder: t("notifyEmailPlaceholder"),
      cta: t("notifyCta"),
      dismiss: t("dismiss"),
      privacy: t("notifyPrivacy"),
      success: t("notifySuccess"),
    };
  }, [t]);

  function dismiss() {
    setOpen(false);
    setApi({ status: "idle" });
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const raw = email.trim();
    if (!raw) return;
    setApi({ status: "submitting" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: raw }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: unknown };
      if (!res.ok) {
        const msg = typeof data.error === "string" ? data.error : "Failed.";
        setApi({ status: "error", message: msg });
        return;
      }
      setApi({ status: "success" });
    } catch {
      setApi({ status: "error", message: "Failed." });
    }
  }

  if (!open || !shouldConsiderShowing) return null;

  return (
    <Backdrop
      role="dialog"
      aria-modal="true"
      aria-label={strings.title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <Card>
        <Top>
          <TitleBlock>
            <Eyebrow>{strings.badge}</Eyebrow>
            <Title>{strings.title}</Title>
          </TitleBlock>
          <Close type="button" onClick={dismiss} aria-label={strings.dismiss}>
            <XIcon />
          </Close>
        </Top>
        <Body>
          <Copy>{strings.body}</Copy>

          <Divider />

          <Form onSubmit={submit}>
            <Email
              ref={firstFocusRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              name="email"
              autoComplete="email"
              placeholder={strings.emailPlaceholder}
              aria-label={strings.emailLabel}
              required
              disabled={api.status === "submitting" || api.status === "success"}
            />
            <Primary
              type="submit"
              disabled={
                api.status === "submitting" ||
                api.status === "success" ||
                !email.trim()
              }
            >
              {api.status === "submitting" ? t("busy") : strings.cta}
            </Primary>
          </Form>

          {api.status === "success" ? (
            <Message $tone="good">{strings.success}</Message>
          ) : null}
          {api.status === "error" ? (
            <Message $tone="bad">{api.message}</Message>
          ) : null}

          <FinePrint>{strings.privacy}</FinePrint>

          <SecondaryRow>
            <div />
            <Secondary type="button" onClick={dismiss}>
              {strings.dismiss}
            </Secondary>
          </SecondaryRow>
        </Body>
      </Card>
    </Backdrop>
  );
}
