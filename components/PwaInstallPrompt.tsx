"use client";

import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STORAGE_KEY = "plaasmark-install-dismissed";

const Bar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Text = styled.p`
  margin: 0;
  flex: 1 1 200px;
  font-size: 0.875rem;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.textDark};
  text-align: center;
`;

const BtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
`;

const PrimaryBtn = styled.button`
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const GhostBtn = styled.button`
  padding: 10px 16px;
  border: 1px solid ${({ theme }) => theme.colors.textLight};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

export function PwaInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      setOpen(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
    setEvent(null);
  }, []);

  const install = useCallback(async () => {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    setOpen(false);
    setEvent(null);
  }, [event]);

  if (!open || !event) return null;

  return (
    <Bar role="dialog" aria-label="Install app">
      <Text>Install PlaasMark for quick access from your home screen.</Text>
      <BtnRow>
        <PrimaryBtn type="button" onClick={install}>
          Install
        </PrimaryBtn>
        <GhostBtn type="button" onClick={dismiss}>
          Not now
        </GhostBtn>
      </BtnRow>
    </Bar>
  );
}
