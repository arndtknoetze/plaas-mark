"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useCart } from "@/lib/cart-context";
import { loadStoredCustomer, saveStoredCustomer } from "@/lib/customer-storage";
import { useLanguage } from "@/lib/useLanguage";

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 16px;
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

const Subtitle = styled.p`
  margin: 0 0 24px;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Section = styled.section`
  margin-bottom: 28px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Line = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.05);
`;

const LineMain = styled.div`
  min-width: 0;
`;

const LineName = styled.span`
  display: block;
  font-weight: 600;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.textDark};
`;

const LineVendor = styled.span`
  display: block;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: 2px;
`;

const LineQty = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: 4px;
  display: block;
`;

const LinePrice = styled.span`
  font-weight: 700;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Input = styled.input`
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #d8d8d4;
  border-radius: 10px;
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

const TextArea = styled.textarea`
  width: 100%;
  min-height: 96px;
  padding: 12px 14px;
  border: 1px solid #d8d8d4;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  resize: vertical;
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

const OptionalHint = styled.span`
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textLight};
`;

const SubmitBtn = styled.button`
  width: 100%;
  min-height: 52px;
  margin-top: 8px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
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
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  background: #ffffff;
  cursor: pointer;
  transition:
    background 0.15s ease,
    opacity 0.15s ease,
    color 0.15s ease;

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

const HintText = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.textLight};
`;

const DevCodeHint = styled(HintText)`
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff8e6;
  border: 1px solid #f0e0b8;
  color: #5c4a1c;
`;

const VerifiedLine = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const ErrorMsg = styled.p`
  margin: 0;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #8a1c1c;
  background: #fdeaea;
  border: 1px solid #f0c4c4;
`;

const SuccessBox = styled.div`
  padding: 20px 16px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
`;

const SuccessTitle = styled.p`
  margin: 0 0 8px;
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const SuccessText = styled.p`
  margin: 0 0 16px;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textDark};
`;

const SuccessMeta = styled.p`
  margin: 0 0 20px;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textLight};
  word-break: break-all;
`;

const ShopLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 20px;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const EmptyText = styled.p`
  margin: 0 0 16px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

function formatPrice(value: number) {
  return `R ${value.toFixed(2).replace(".", ",")}`;
}

function normalizePhone(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { items, clearCart } = useCart();
  const [name, setName] = useState(() => {
    if (typeof window === "undefined") return "";
    return loadStoredCustomer()?.name ?? "";
  });
  const [phone, setPhone] = useState(() => {
    if (typeof window === "undefined") return "";
    return loadStoredCustomer()?.phone ?? "";
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null,
  );
  const [verifiedForPhone, setVerifiedForPhone] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [disablePhoneOtp, setDisablePhoneOtp] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then((r) => r.json())
      .then((d: unknown) => {
        if (
          cancelled ||
          !d ||
          typeof d !== "object" ||
          (d as { disablePhoneOtp?: unknown }).disablePhoneOtp !== true
        ) {
          return;
        }
        setDisablePhoneOtp(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const phoneNorm = normalizePhone(phone);
  const phoneVerified =
    disablePhoneOtp && Boolean(phoneNorm)
      ? true
      : Boolean(verificationToken) &&
        verifiedForPhone !== null &&
        phoneNorm === verifiedForPhone;

  const resetPhoneVerification = () => {
    setVerificationToken(null);
    setVerifiedForPhone(null);
    setOtpCode("");
    setCodeSent(false);
    setDevOtpHint(null);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    resetPhoneVerification();
  };

  const sendOtp = async () => {
    setError(null);
    setDevOtpHint(null);
    if (!phoneNorm) {
      setError(t("errFillPhoneFirst"));
      return;
    }
    setSendingOtp(true);
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
      setVerificationToken(null);
      setVerifiedForPhone(null);
      setOtpCode("");
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errUnknown"));
    } finally {
      setSendingOtp(false);
    }
  };

  const confirmOtp = async () => {
    setError(null);
    const digits = otpCode.replace(/\D/g, "");
    if (digits.length !== 6) {
      setError(t("errEnterSixDigitCode"));
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/verify-phone/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNorm, code: digits }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : t("errVerificationFailed");
        throw new Error(msg);
      }
      if (
        !data ||
        typeof data !== "object" ||
        !("verificationToken" in data) ||
        typeof (data as { verificationToken: unknown }).verificationToken !==
          "string"
      ) {
        throw new Error(t("errInvalidServerResponse"));
      }
      const token = (data as { verificationToken: string }).verificationToken;
      setVerificationToken(token);
      setVerifiedForPhone(phoneNorm);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errUnknown"));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!disablePhoneOtp && (!phoneVerified || !verificationToken)) {
      setError(t("errVerifyPhoneBeforeCheckout"));
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        customer: {
          name: name.trim(),
          phone: phoneNorm,
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
        items,
      };
      if (!disablePhoneOtp && verificationToken) {
        payload.verificationToken = verificationToken;
      }

      const res = await fetch("/api/orders", {
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
            : t("errCouldNotPlaceOrder");
        throw new Error(msg);
      }
      if (
        !data ||
        typeof data !== "object" ||
        !("orderId" in data) ||
        typeof (data as { orderId: unknown }).orderId !== "string"
      ) {
        throw new Error(t("errInvalidServerResponse"));
      }
      const id = (data as { orderId: string }).orderId;
      saveStoredCustomer(name.trim(), phoneNorm);
      setOrderId(id);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errUnknown"));
    } finally {
      setSubmitting(false);
    }
  };

  if (orderId) {
    return (
      <>
        <BackLink href="/shop">{t("backToShop")}</BackLink>
        <SuccessBox>
          <SuccessTitle>{t("orderReceivedTitle")}</SuccessTitle>
          <SuccessText>{t("orderReceivedBody")}</SuccessText>
          <SuccessMeta>
            {t("orderNumberLabel")} {orderId}
          </SuccessMeta>
          <ShopLink href="/shop">{t("continueShopping")}</ShopLink>
        </SuccessBox>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <BackLink href="/shop">{t("backToShop")}</BackLink>
        <Title>{t("checkout")}</Title>
        <EmptyText>{t("cartEmptyCheckout")}</EmptyText>
        <ShopLink href="/shop">{t("browseProducts")}</ShopLink>
      </>
    );
  }

  return (
    <>
      <BackLink href="/cart">{t("backToCart")}</BackLink>
      <Title>{t("checkout")}</Title>
      <Subtitle>
        {disablePhoneOtp
          ? t("checkoutSubtitleDev")
          : t("checkoutSubtitleNormal")}
      </Subtitle>

      <Section>
        <SectionTitle>{t("checkoutYourOrderSection")}</SectionTitle>
        <List>
          {items.map((line) => (
            <Line key={line.productId}>
              <LineMain>
                <LineName>{line.name}</LineName>
                {line.vendorName ? (
                  <LineVendor>{line.vendorName}</LineVendor>
                ) : null}
                <LineQty>
                  {formatPrice(line.price)} × {line.quantity}
                </LineQty>
              </LineMain>
              <LinePrice>{formatPrice(line.price * line.quantity)}</LinePrice>
            </Line>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>{t("contactSection")}</SectionTitle>
        <Form onSubmit={handleSubmit}>
          {error ? <ErrorMsg role="alert">{error}</ErrorMsg> : null}
          <Field>
            <Label htmlFor="checkout-name">{t("labelName")}</Label>
            <Input
              id="checkout-name"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("placeholderFullName")}
            />
          </Field>
          <Field>
            <Label htmlFor="checkout-phone">{t("labelPhone")}</Label>
            <Input
              id="checkout-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder={t("placeholderPhone")}
            />
            {!disablePhoneOtp ? (
              <>
                <SecondaryBtn
                  type="button"
                  onClick={() => void sendOtp()}
                  disabled={sendingOtp || !phoneNorm}
                >
                  {sendingOtp
                    ? t("sendingVerificationCode")
                    : t("sendVerificationCode")}
                </SecondaryBtn>
                {devOtpHint ? (
                  <DevCodeHint>
                    {t("checkoutDevOtpBannerPrefix")}
                    <strong>{devOtpHint}</strong>{" "}
                    {t("checkoutDevOtpBannerSuffix")}
                  </DevCodeHint>
                ) : codeSent ? (
                  <HintText>{t("otpSentHint")}</HintText>
                ) : (
                  <HintText>{t("otpRequestHint")}</HintText>
                )}
              </>
            ) : (
              <HintText>{t("checkoutNoOtpHint")}</HintText>
            )}
          </Field>
          {!disablePhoneOtp && codeSent ? (
            <Field>
              <Label htmlFor="checkout-otp">{t("otpCodeLabel")}</Label>
              <Input
                id="checkout-otp"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
              />
              <SecondaryBtn
                type="button"
                onClick={() => void confirmOtp()}
                disabled={
                  verifyingOtp || otpCode.replace(/\D/g, "").length !== 6
                }
              >
                {verifyingOtp ? t("verifyingPhone") : t("confirmPhone")}
              </SecondaryBtn>
            </Field>
          ) : null}
          {!disablePhoneOtp && phoneVerified ? (
            <VerifiedLine>{t("verifiedPhoneLine")}</VerifiedLine>
          ) : disablePhoneOtp && phoneNorm ? (
            <VerifiedLine>{t("verifiedDevModeLine")}</VerifiedLine>
          ) : null}
          <Field>
            <Label htmlFor="checkout-notes">
              {t("notesLabel")} <OptionalHint>{t("optionalTag")}</OptionalHint>
            </Label>
            <TextArea
              id="checkout-notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("placeholderNotes")}
            />
          </Field>
          <SubmitBtn type="submit" disabled={submitting || !phoneVerified}>
            {submitting ? t("submittingOrder") : t("placeOrder")}
          </SubmitBtn>
        </Form>
      </Section>
    </>
  );
}
