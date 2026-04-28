"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled, { keyframes } from "styled-components";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
  createdAt: number;
  durationMs: number;
};

type ToastOptions = {
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastApi = {
  show: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: Omit<ToastOptions, "variant">) => void;
  error: (message: string, options?: Omit<ToastOptions, "variant">) => void;
  info: (message: string, options?: Omit<ToastOptions, "variant">) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const slideIn = keyframes`
  from { transform: translateY(-6px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Viewport = styled.div`
  position: fixed;
  top: 12px;
  left: 0;
  right: 0;
  z-index: 200;
  pointer-events: none;
  display: flex;
  justify-content: center;
  padding: 0 12px;
`;

const Stack = styled.div`
  width: min(560px, 100%);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ToastCard = styled.div<{ $variant: ToastVariant }>`
  pointer-events: auto;
  border-radius: 14px;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 14px 28px rgba(0, 0, 0, 0.12);
  animation: ${slideIn} 0.16s ease-out;

  display: grid;
  grid-template-columns: 10px 1fr;
  gap: 12px;

  ${({ $variant }) =>
    $variant === "success"
      ? "border-color: rgba(46, 94, 62, 0.22);"
      : $variant === "error"
        ? "border-color: rgba(138, 28, 28, 0.22);"
        : "border-color: rgba(0, 0, 0, 0.12);"}
`;

const Accent = styled.div<{ $variant: ToastVariant }>`
  border-radius: 999px;
  background: ${({ $variant, theme }) =>
    $variant === "success"
      ? theme.colors.primary
      : $variant === "error"
        ? "#8a1c1c"
        : theme.colors.accent};
`;

const Message = styled.div`
  font-size: 0.9375rem;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.textDark};
  font-weight: 650;
  word-break: break-word;
`;

const CloseBtn = styled.button`
  margin-left: auto;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
  line-height: 1;
  font-weight: 900;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
    border-radius: 6px;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
`;

function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timersRef.current.get(id);
    if (t) window.clearTimeout(t);
    timersRef.current.delete(id);
  }, []);

  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      const msg = message.trim();
      if (!msg) return;

      const toast: ToastItem = {
        id: randomId(),
        message: msg,
        variant: options?.variant ?? "info",
        createdAt: Date.now(),
        durationMs: options?.durationMs ?? 3500,
      };

      setToasts((prev) => {
        const next = [toast, ...prev];
        return next.slice(0, 4);
      });

      const timeout = window.setTimeout(
        () => dismiss(toast.id),
        toast.durationMs,
      );
      timersRef.current.set(toast.id, timeout);
    },
    [dismiss],
  );

  const api: ToastApi = useMemo(
    () => ({
      show,
      success: (m, o) => show(m, { ...o, variant: "success" }),
      error: (m, o) => show(m, { ...o, variant: "error" }),
      info: (m, o) => show(m, { ...o, variant: "info" }),
    }),
    [show],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const t of timers.values()) window.clearTimeout(t);
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Viewport aria-live="polite" aria-relevant="additions text">
        <Stack>
          {toasts.map((t) => (
            <ToastCard key={t.id} $variant={t.variant} role="status">
              <Accent $variant={t.variant} aria-hidden />
              <Row>
                <Message>{t.message}</Message>
                <CloseBtn
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => dismiss(t.id)}
                >
                  ×
                </CloseBtn>
              </Row>
            </ToastCard>
          ))}
        </Stack>
      </Viewport>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      show: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}
