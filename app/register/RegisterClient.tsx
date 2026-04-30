"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useToast } from "@/components/ToastProvider";
import { useLanguage } from "@/lib/useLanguage";
import { saveStoredSession } from "@/lib/session-storage";
import { useResolvedLocationSlug } from "@/lib/useResolvedLocationSlug";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-policy";

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 800;
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
  font-weight: 700;
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

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const CheckRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Check = styled.input`
  margin-top: 3px;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
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
  font-weight: 800;
  letter-spacing: -0.01em;
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

const FooterHint = styled.p`
  margin: 16px 0 0;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;

  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 700;
  }
`;

export function RegisterClient() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const locationSlug = useResolvedLocationSlug();
  /** Match server first paint (no localStorage); then sync to stored / route location. */
  const [shopHref, setShopHref] = useState("/");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- shop link must update after mount so href matches SSR (no localStorage on server) */
    setShopHref(locationSlug ? `/${locationSlug}/shop` : "/");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [locationSlug]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wantToSell, setWantToSell] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nameTrim = name.trim();
    const emailTrim = email.trim().toLowerCase();
    if (!nameTrim) {
      setError(language === "af" ? "Vul jou naam in." : "Enter your name.");
      return;
    }
    if (!emailTrim) {
      setError(
        language === "af" ? "Vul jou e-pos in." : "Enter your email address.",
      );
      return;
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(
        language === "af"
          ? `Wagwoord moet minstens ${PASSWORD_MIN_LENGTH} karakters wees.`
          : `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      );
      return;
    }
    if (password !== passwordConfirm) {
      setError(
        language === "af"
          ? "Wagwoorde stem nie ooreen nie."
          : "Passwords do not match.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameTrim,
          email: emailTrim,
          password,
          phone: phone.trim() || undefined,
          wantsToSell: wantToSell,
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
            : t("registrationFailed");
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
        return {
          name: o.name.trim(),
          ...(em ? { email: em } : {}),
          ...(ph ? { phone: ph } : {}),
        };
      })();
      if (!session || !session.email) {
        throw new Error(t("errInvalidServerResponse"));
      }

      saveStoredSession(session);
      toast.success(
        language === "af" ? "Welkom by PlaasMark!" : "Welcome to PlaasMark!",
      );

      const wants =
        data &&
        typeof data === "object" &&
        "wantsToSell" in data &&
        (data as { wantsToSell?: unknown }).wantsToSell === true;

      if (wants) {
        router.replace("/onboarding");
      } else {
        const shopDestination = locationSlug ? `/${locationSlug}/shop` : "/";
        router.replace(shopDestination);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("errUnknown");
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Title>{t("registerTitle")}</Title>
      <Subtitle>
        {language === "af"
          ? "Skep jou rekening met e-pos en wagwoord."
          : "Create your account with your email and a password."}
      </Subtitle>

      <Card>
        <Form onSubmit={submit}>
          {error ? <ErrorMsg role="alert">{error}</ErrorMsg> : null}

          <Field>
            <Label htmlFor="reg-name">{t("labelName")}</Label>
            <Input
              id="reg-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("placeholderFullName")}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="reg-email">
              {language === "af" ? "E-pos" : "Email"}
            </Label>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </Field>

          <Field>
            <Label htmlFor="reg-password">
              {language === "af" ? "Wagwoord" : "Password"}
            </Label>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                language === "af"
                  ? `Min. ${PASSWORD_MIN_LENGTH} karakters`
                  : `Min. ${PASSWORD_MIN_LENGTH} characters`
              }
              required
              minLength={PASSWORD_MIN_LENGTH}
            />
          </Field>

          <Field>
            <Label htmlFor="reg-password2">
              {language === "af" ? "Bevestig wagwoord" : "Confirm password"}
            </Label>
            <Input
              id="reg-password2"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={PASSWORD_MIN_LENGTH}
            />
          </Field>

          <Field>
            <Label htmlFor="reg-phone">{t("labelPhone")}</Label>
            <Input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={language === "af" ? "Opsioneel" : "Optional"}
            />
          </Field>

          <CheckRow htmlFor="reg-sell">
            <Check
              id="reg-sell"
              type="checkbox"
              checked={wantToSell}
              onChange={(e) => setWantToSell(e.target.checked)}
            />
            <span>
              {language === "af"
                ? "Ek wil produkte verkoop"
                : "I want to sell products"}
            </span>
          </CheckRow>

          <PrimaryBtn type="submit" disabled={submitting}>
            {submitting
              ? t("busy")
              : language === "af"
                ? "Gaan voort"
                : "Continue"}
          </PrimaryBtn>
        </Form>
      </Card>

      <FooterHint>
        {language === "af"
          ? "Reeds 'n rekening? "
          : "Already have an account? "}
        <Link href="/login">{t("signIn")}</Link>
        {" · "}
        <Link href={shopHref}>{t("shop")}</Link>
      </FooterHint>
    </>
  );
}
