"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { useToast } from "@/components/ToastProvider";
import { loadStoredSession } from "@/lib/session-storage";

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 1.6rem;
  font-weight: 950;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Subtitle = styled.p`
  margin: 0 0 18px;
  font-size: 0.95rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};
`;

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

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

function normalizePhone(v: string) {
  return v.trim().replace(/\s+/g, " ");
}

export function AdminLoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const toast = useToast();
  const nextPath = search.get("next") || "/admin";

  const [disablePhoneOtp, setDisablePhoneOtp] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
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

  // If the user is already signed in (site session cookie is set by /api/login),
  // try to bootstrap admin access without forcing a second login prompt.
  useEffect(() => {
    const existing = loadStoredSession();
    if (!existing) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/bootstrap", { method: "POST" });
        if (!res.ok) return;
        if (!cancelled) router.replace(nextPath);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nextPath, router]);

  const phoneNorm = normalizePhone(phone);

  const loginDirectNoOtp = async () => {
    setError(null);
    if (!phoneNorm) {
      setError("Phone is required.");
      return;
    }
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
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
            : "Login failed.";
        throw new Error(msg);
      }
      toast.success("Signed in.");
      router.push(nextPath);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoggingIn(false);
    }
  };

  const sendOtp = async () => {
    setError(null);
    setDevOtpHint(null);
    if (!phoneNorm) {
      setError("Phone is required.");
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
            : "Could not send code.";
        throw new Error(msg);
      }
      if (data && typeof data === "object" && "devCode" in data) {
        const c = (data as { devCode?: unknown }).devCode;
        if (typeof c === "string") setDevOtpHint(c);
      }
      setCodeSent(true);
      setOtpCode("");
      toast.success("Code sent.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not send code.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const loginWithOtp = async () => {
    setError(null);
    const digits = otpCode.replace(/\D/g, "");
    if (!phoneNorm) {
      setError("Phone is required.");
      return;
    }
    if (digits.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    setVerifying(true);
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
            : "Verification failed.";
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
      if (!verificationToken) throw new Error("Invalid server response.");

      setLoggingIn(true);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNorm, verificationToken }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Login failed.";
        throw new Error(msg);
      }
      toast.success("Signed in.");
      router.push(nextPath);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
      setLoggingIn(false);
    }
  };

  return (
    <>
      <Title>Admin</Title>
      <Subtitle>
        {disablePhoneOtp
          ? "Dev login. Enter your admin phone number."
          : "Enter your phone number, request a code, then sign in."}
      </Subtitle>
      <Card>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            if (disablePhoneOtp) void loginDirectNoOtp();
            else void loginWithOtp();
          }}
        >
          {error ? <ErrorMsg role="alert">{error}</ErrorMsg> : null}

          <Field>
            <Label htmlFor="admin-phone">Phone</Label>
            <Input
              id="admin-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setCodeSent(false);
                setOtpCode("");
                setDevOtpHint(null);
              }}
              placeholder="+27..."
              required
            />
            {!disablePhoneOtp ? (
              <>
                <SecondaryBtn
                  type="button"
                  onClick={() => void sendOtp()}
                  disabled={sending || !phoneNorm}
                >
                  {sending ? "Sending..." : "Send code"}
                </SecondaryBtn>
                {devOtpHint ? (
                  <Hint>
                    Dev OTP: <strong>{devOtpHint}</strong>
                  </Hint>
                ) : (
                  <Hint>We’ll send a 6-digit code.</Hint>
                )}
              </>
            ) : (
              <Hint>OTP is disabled in this environment.</Hint>
            )}
          </Field>

          {!disablePhoneOtp && codeSent ? (
            <Field>
              <Label htmlFor="admin-otp">Code</Label>
              <Input
                id="admin-otp"
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
                ? !phoneNorm || loggingIn
                : !codeSent ||
                  verifying ||
                  loggingIn ||
                  otpCode.replace(/\D/g, "").length !== 6
            }
          >
            {verifying || loggingIn ? "Signing in..." : "Sign in"}
          </PrimaryBtn>
        </Form>
      </Card>
    </>
  );
}
