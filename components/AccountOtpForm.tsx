"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { saveStoredSession } from "@/lib/session-storage";

const Card = styled.div`
  padding: 16px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 10px rgba(0, 0, 0, 0.06);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Input = styled.input`
  width: 100%;
  min-height: 50px;
  padding: 0 14px;
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(46, 94, 62, 0.15);
  }
`;

const Hint = styled.p`
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ErrorMsg = styled.p`
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #8a1c1c;
  background: #fdeaea;
  border: 1px solid #f0c4c4;
`;

const PrimaryBtn = styled.button`
  width: 100%;
  min-height: 54px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 900;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;

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

const SecondaryBtn = styled.button`
  width: 100%;
  min-height: 48px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
  background: #ffffff;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background};
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

function normalizePhone(v: string) {
  return v.trim().replace(/\s+/g, " ");
}

type Props = {
  onSuccess?: () => void;
};

export function AccountOtpForm({ onSuccess }: Props) {
  const [disablePhoneOtp, setDisablePhoneOtp] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then((r) => r.json())
      .then((d: unknown) => {
        if (cancelled || !d || typeof d !== "object") return;
        if (
          "disablePhoneOtp" in d &&
          (d as { disablePhoneOtp?: unknown }).disablePhoneOtp === true
        ) {
          setDisablePhoneOtp(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const phoneNorm = normalizePhone(phone);

  const sendOtp = async () => {
    setError(null);
    setDevOtpHint(null);
    if (!phoneNorm) {
      setError("Vul eers jou foonnommer in.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/verify-phone/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNorm }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Kon nie kode stuur nie.";
        throw new Error(msg);
      }
      if (data && typeof data === "object" && "devCode" in data) {
        const c = (data as { devCode?: unknown }).devCode;
        if (typeof c === "string") setDevOtpHint(c);
      }
      setCodeSent(true);
      setOtpCode("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onbekende fout.");
    } finally {
      setSending(false);
    }
  };

  const finishDevNoOtp = async () => {
    setError(null);
    const n = name.trim();
    if (!n) {
      setError("Vul jou naam in.");
      return;
    }
    if (!phoneNorm) {
      setError("Vul jou foonnommer in.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/register/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, phone: phoneNorm }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Kon nie rekening skep nie.";
        throw new Error(msg);
      }
      saveStoredSession({ name: n, phone: phoneNorm });
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onbekende fout.");
    } finally {
      setSubmitting(false);
    }
  };

  const finishWithOtp = async () => {
    setError(null);
    const n = name.trim();
    if (!n) {
      setError("Vul jou naam in.");
      return;
    }
    if (!phoneNorm) {
      setError("Vul jou foonnommer in.");
      return;
    }
    const digits = otpCode.replace(/\D/g, "");
    if (digits.length !== 6) {
      setError("Voer die 6-syfer kode in.");
      return;
    }

    setSubmitting(true);
    try {
      const confirmRes = await fetch("/api/verify-phone/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNorm, code: digits }),
      });
      const confirmData: unknown = await confirmRes.json().catch(() => null);
      if (!confirmRes.ok) {
        const msg =
          confirmData &&
          typeof confirmData === "object" &&
          "error" in confirmData &&
          typeof (confirmData as { error: unknown }).error === "string"
            ? (confirmData as { error: string }).error
            : "Verifikasie het misluk.";
        throw new Error(msg);
      }
      const verificationToken =
        confirmData &&
        typeof confirmData === "object" &&
        "verificationToken" in confirmData &&
        typeof (confirmData as { verificationToken: unknown })
          .verificationToken === "string"
          ? (confirmData as { verificationToken: string }).verificationToken
          : null;
      if (!verificationToken)
        throw new Error("Ongeldige antwoord van bediener.");

      const res = await fetch("/api/register/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          phone: phoneNorm,
          verificationToken,
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Kon nie rekening skep nie.";
        throw new Error(msg);
      }
      saveStoredSession({ name: n, phone: phoneNorm });
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onbekende fout.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          if (disablePhoneOtp) void finishDevNoOtp();
          else void finishWithOtp();
        }}
      >
        {error ? <ErrorMsg role="alert">{error}</ErrorMsg> : null}

        <Field>
          <Label htmlFor="acct-name">Naam</Label>
          <Input
            id="acct-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jou naam"
            required
          />
        </Field>

        <Field>
          <Label htmlFor="acct-phone">Foon</Label>
          <Input
            id="acct-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setCodeSent(false);
              setOtpCode("");
              setDevOtpHint(null);
            }}
            placeholder="Bv. 082 123 4567"
            required
          />
          {!disablePhoneOtp ? (
            <>
              <SecondaryBtn
                type="button"
                onClick={() => void sendOtp()}
                disabled={sending || !phoneNorm}
              >
                {sending ? "Stuur kode…" : "Stuur verifikasiekode"}
              </SecondaryBtn>
              {devOtpHint ? (
                <Hint>
                  Ontwikkeling: jou kode is <strong>{devOtpHint}</strong>
                </Hint>
              ) : (
                <Hint>Ons stuur ’n 6-syfer kode om jou foon te bevestig.</Hint>
              )}
            </>
          ) : (
            <Hint>Ontwikkelmodus: geen OTP op hierdie bediener nie.</Hint>
          )}
        </Field>

        {!disablePhoneOtp && codeSent ? (
          <Field>
            <Label htmlFor="acct-otp">6-syfer kode</Label>
            <Input
              id="acct-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
            />
          </Field>
        ) : null}

        <PrimaryBtn
          type="submit"
          disabled={
            disablePhoneOtp
              ? !name.trim() || !phoneNorm || submitting
              : !codeSent ||
                !name.trim() ||
                submitting ||
                otpCode.replace(/\D/g, "").length !== 6
          }
        >
          {submitting ? "Besig…" : "Gaan voort"}
        </PrimaryBtn>
      </Form>
    </Card>
  );
}
