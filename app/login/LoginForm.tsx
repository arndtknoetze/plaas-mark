"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useToast } from "@/components/ToastProvider";
import { useLanguage } from "@/lib/useLanguage";
import { saveStoredSession } from "@/lib/session-storage";
import { useResolvedLocationSlug } from "@/lib/useResolvedLocationSlug";

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    font-size: 1.9rem;
  }
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

export function LoginForm() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const location = useResolvedLocationSlug();
  const shopHref = location ? `/${location}/shop` : "/";
  const [disablePhoneOtp, setDisablePhoneOtp] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
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

  const loginDirectNoOtp = async () => {
    setError(null);
    if (!phoneNorm) {
      setError(t("errFillPhoneFirst"));
      return;
    }
    setLoggingIn(true);
    try {
      const payload = phoneNorm.includes("@")
        ? { email: phoneNorm.toLowerCase(), password: loginPassword }
        : { phone: phoneNorm, password: loginPassword };
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : t("errUnknown");
        throw new Error(msg);
      }
      const session = (() => {
        if (!data || typeof data !== "object" || !("session" in data))
          return null;
        const s = (data as { session?: unknown }).session;
        if (!s || typeof s !== "object") return null;
        const o = s as Record<string, unknown>;
        if (typeof o.name !== "string") return null;
        const em = typeof o.email === "string" ? o.email.trim() : "";
        const ph = typeof o.phone === "string" ? o.phone.trim() : "";
        if (!em && !ph) return null;
        return {
          name: o.name.trim(),
          ...(em ? { email: em } : {}),
          ...(ph ? { phone: ph } : {}),
        } as const;
      })();
      if (!session) throw new Error(t("errInvalidServerResponse"));

      saveStoredSession(session);
      toast.success(language === "af" ? "Aangeteken." : "Signed in.");
      router.push("/account");
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("errUnknown");
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
      setError(t("errFillPhoneFirst"));
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
            : t("errCouldNotSendCode");
        throw new Error(msg);
      }
      if (data && typeof data === "object" && "devCode" in data) {
        const c = (data as { devCode?: unknown }).devCode;
        if (typeof c === "string") setDevOtpHint(c);
      }
      setCodeSent(true);
      setOtpCode("");
      toast.success(t("otpSentHint") ?? "Code sent.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("errUnknown");
      setError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const login = async () => {
    setError(null);
    const digits = otpCode.replace(/\D/g, "");
    if (!phoneNorm) {
      setError(t("errFillPhoneFirst"));
      return;
    }
    if (digits.length !== 6) {
      setError(t("errEnterSixDigitCode"));
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
            : t("errVerificationFailed");
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
      if (!verificationToken) throw new Error(t("errInvalidServerResponse"));

      setLoggingIn(true);
      const res = await fetch("/api/login", {
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
            : t("errUnknown");
        throw new Error(msg);
      }
      const session = (() => {
        if (!data || typeof data !== "object" || !("session" in data))
          return null;
        const s = (data as { session?: unknown }).session;
        if (!s || typeof s !== "object") return null;
        const o = s as Record<string, unknown>;
        if (typeof o.name !== "string") return null;
        const em = typeof o.email === "string" ? o.email.trim() : "";
        const ph = typeof o.phone === "string" ? o.phone.trim() : "";
        if (!em && !ph) return null;
        return {
          name: o.name.trim(),
          ...(em ? { email: em } : {}),
          ...(ph ? { phone: ph } : {}),
        } as const;
      })();
      if (!session) throw new Error(t("errInvalidServerResponse"));

      saveStoredSession(session);
      toast.success(language === "af" ? "Aangeteken." : "Signed in.");
      router.push("/account");
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("errUnknown");
      setError(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
      setLoggingIn(false);
    }
  };

  return (
    <>
      <Title>{t("loginTitle")}</Title>
      <Subtitle>
        {disablePhoneOtp ? t("loginSubtitleNoOtp") : t("loginSubtitleOtp")}
      </Subtitle>
      <Card>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            if (disablePhoneOtp) void loginDirectNoOtp();
            else void login();
          }}
        >
          {error ? <ErrorMsg role="alert">{error}</ErrorMsg> : null}

          <Field>
            <Label htmlFor="login-phone">
              {disablePhoneOtp
                ? language === "af"
                  ? "E-pos of foon"
                  : "Email or phone"
                : t("labelPhone")}
            </Label>
            <Input
              id="login-phone"
              type={disablePhoneOtp ? "text" : "tel"}
              autoComplete={disablePhoneOtp ? "username" : "tel"}
              inputMode={disablePhoneOtp ? undefined : "tel"}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setCodeSent(false);
                setOtpCode("");
                setDevOtpHint(null);
              }}
              placeholder={
                disablePhoneOtp
                  ? language === "af"
                    ? "jy@voorbeeld.com of 082 …"
                    : "you@example.com or phone"
                  : t("placeholderPhone")
              }
              required
            />
            {!disablePhoneOtp ? (
              <>
                <SecondaryBtn
                  type="button"
                  onClick={() => void sendOtp()}
                  disabled={sending || !phoneNorm}
                >
                  {sending
                    ? t("sendingVerificationCode")
                    : t("sendVerificationCode")}
                </SecondaryBtn>
                {devOtpHint ? (
                  <Hint>
                    {t("checkoutDevOtpBannerPrefix")}
                    <strong>{devOtpHint}</strong>
                  </Hint>
                ) : (
                  <Hint>{t("loginOtpSmsHint")}</Hint>
                )}
              </>
            ) : (
              <Hint>
                {language === "af"
                  ? "Gebruik die wagwoord wat jy by registrasie gestel het."
                  : "Use the password you set when you registered."}
              </Hint>
            )}
          </Field>

          {disablePhoneOtp ? (
            <Field>
              <Label htmlFor="login-password">
                {language === "af" ? "Wagwoord" : "Password"}
              </Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </Field>
          ) : null}

          {!disablePhoneOtp && codeSent ? (
            <Field>
              <Label htmlFor="login-otp">{t("otpCodeLabel")}</Label>
              <Input
                id="login-otp"
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
            {verifying || loggingIn ? t("busy") : t("signIn")}
          </PrimaryBtn>

          <Hint>
            {t("loginNewUserHintPrefix")}{" "}
            <Link href="/register">{t("register")}</Link> {t("or") ?? "of"}{" "}
            <Link href={shopHref}>{t("loginNewUserHintShop")}</Link>.
          </Hint>
        </Form>
      </Card>
    </>
  );
}
