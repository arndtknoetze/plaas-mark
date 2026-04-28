"use client";

import { useActionState, useEffect, useRef } from "react";
import { useToast } from "@/components/ToastProvider";

export type AdminActionResult = {
  ok: boolean;
  toast?: string;
  error?: string;
  nonce?: string;
};

type Props = {
  action: (
    prevState: AdminActionResult | null,
    formData: FormData,
  ) => Promise<AdminActionResult>;
  children: React.ReactNode;
  className?: string;
  id?: string;
  successMessage?: string;
};

export function AdminToastForm({
  action,
  children,
  className,
  id,
  successMessage,
}: Props) {
  const toast = useToast();
  const [state, formAction, pending] = useActionState(action, null);
  const lastNonce = useRef<string | null>(null);

  useEffect(() => {
    if (!state) return;
    if (state.nonce && state.nonce === lastNonce.current) return;
    if (state.nonce) lastNonce.current = state.nonce;

    if (state.ok) {
      toast.success(state.toast ?? successMessage ?? "Saved.");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, successMessage, toast]);

  return (
    <form action={formAction} className={className} id={id}>
      <fieldset style={{ border: 0, margin: 0, padding: 0 }} disabled={pending}>
        {children}
      </fieldset>
    </form>
  );
}
