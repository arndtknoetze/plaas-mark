"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { saveStoredCustomer } from "@/lib/customer-storage";
import { saveStoredSession } from "@/lib/session-storage";

type Role = "customer" | "seller";

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

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 18px;

  @media (min-width: 560px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const RoleButton = styled.button<{ $active: boolean }>`
  text-align: left;
  width: 100%;
  border: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : "#e2e2de")};
  background: ${({ $active }) =>
    $active ? "rgba(46, 94, 62, 0.06)" : "#ffffff"};
  border-radius: 14px;
  padding: 14px 14px 12px;
  cursor: pointer;
  min-height: 72px;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const RoleTitle = styled.div`
  font-weight: 800;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.textDark};
`;

const RoleHint = styled.div`
  margin-top: 4px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 14px;
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

const ColorRow = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 10px;
  align-items: center;
`;

const ColorSwatch = styled.input`
  width: 64px;
  height: 50px;
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  padding: 6px;
  background: #ffffff;
`;

const Hint = styled.p`
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textLight};
`;

const FileInput = styled.input`
  width: 100%;
  min-height: 50px;
  padding: 10px 14px;
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(46, 94, 62, 0.15);
  }
`;

const FileActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const TinyBtn = styled.button`
  min-height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background: #ffffff;
  color: ${({ theme }) => theme.colors.primary};
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

const LogoPreview = styled.div`
  margin-top: 10px;
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  background: #ffffff;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 84px;
  overflow: hidden;
`;

const PreviewImg = styled.img`
  max-width: 100%;
  max-height: 140px;
  object-fit: contain;
  display: block;
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

const SecondaryBtn = styled.button`
  width: 100%;
  min-height: 48px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  background: #ffffff;
  cursor: pointer;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;

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

const Success = styled.div`
  margin-top: 14px;
  padding: 18px 16px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 2px 10px rgba(0, 0, 0, 0.06);
  text-align: center;
`;

const SuccessTitle = styled.p`
  margin: 0 0 6px;
  font-size: 1.15rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
`;

const SuccessText = styled.p`
  margin: 0 0 14px;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textDark};
`;

const SuccessLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 800;
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

function normalizePhone(v: string) {
  return v.trim().replace(/\s+/g, " ");
}

export function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole: Role = useMemo(() => {
    const raw = searchParams.get("role")?.toLowerCase();
    return raw === "seller" ? "seller" : "customer";
  }, [searchParams]);

  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandColor, setBrandColor] = useState("#2E5E3E");
  const [logoUrl, setLogoUrl] = useState("");
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const [otpCode, setOtpCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null,
  );
  const [verifiedForPhone, setVerifiedForPhone] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | { role: Role }>(null);

  const phoneNorm = normalizePhone(phone);
  const phoneVerified =
    Boolean(verificationToken) &&
    verifiedForPhone !== null &&
    phoneNorm === verifiedForPhone;

  const resetVerification = () => {
    setOtpCode("");
    setCodeSent(false);
    setVerificationToken(null);
    setVerifiedForPhone(null);
  };

  const handleLogoFile = async (file: File | null) => {
    if (!file) {
      setLogoUrl("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Kies asseblief ’n prent (PNG/JPG/WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo is te groot. Hou dit onder 2MB.");
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Kon nie lêer lees nie."));
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.readAsDataURL(file);
      });
      setLogoUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon nie logo laai nie.");
    }
  };

  const sendOtp = async () => {
    setError(null);
    if (!phoneNorm) {
      setError("Vul eers jou foonnommer in.");
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
            : "Kon nie kode stuur nie.";
        throw new Error(msg);
      }
      resetVerification();
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setSendingOtp(false);
    }
  };

  const confirmOtp = async () => {
    setError(null);
    const digits = otpCode.replace(/\D/g, "");
    if (digits.length !== 6) {
      setError("Voer die 6-syfer kode in.");
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
            : "Verifikasie het misluk.";
        throw new Error(msg);
      }
      if (
        !data ||
        typeof data !== "object" ||
        !("verificationToken" in data) ||
        typeof (data as { verificationToken: unknown }).verificationToken !==
          "string"
      ) {
        throw new Error("Ongeldige antwoord van bediener.");
      }
      const token = (data as { verificationToken: string }).verificationToken;
      setVerificationToken(token);
      setVerifiedForPhone(phoneNorm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phoneVerified || !verificationToken) {
      setError("Bevestig eers jou foonnommer met die kode.");
      return;
    }
    if (!name.trim()) {
      setError("Vul jou naam in.");
      return;
    }
    if (role === "seller" && !brandName.trim()) {
      setError("Vul jou handelsnaam in.");
      return;
    }

    setSubmitting(true);
    try {
      if (role === "customer") {
        const res = await fetch("/api/register/customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
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
              : "Registrasie het misluk.";
          throw new Error(msg);
        }
        saveStoredCustomer(name.trim(), phoneNorm);
        saveStoredSession({ role, name: name.trim(), phone: phoneNorm });
        setDone({ role });
        return;
      }

      const res = await fetch("/api/register/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phoneNorm,
          brandName: brandName.trim(),
          brandColor,
          logoUrl: logoUrl.trim() ? logoUrl.trim() : null,
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
            : "Registrasie het misluk.";
        throw new Error(msg);
      }
      saveStoredSession({ role, name: name.trim(), phone: phoneNorm });
      if (
        data &&
        typeof data === "object" &&
        "storeId" in data &&
        typeof (data as { storeId?: unknown }).storeId === "string"
      ) {
        const storeId = (data as { storeId: string }).storeId;
        router.push(`/profile?store=${encodeURIComponent(storeId)}`);
        return;
      }
      setDone({ role });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <Title>Welkom by PlaasMark</Title>
        <Subtitle>Jou registrasie is klaar. Jy is reg om te begin.</Subtitle>
        <Success>
          <SuccessTitle>Geregistreer!</SuccessTitle>
          <SuccessText>
            {done.role === "seller"
              ? "Ons sal jou help om jou produkte op te laai. (Verkoper-dashboard kom binnekort.)"
              : "Blaai deur produkte en voeg items by jou mandjie."}
          </SuccessText>
          <SuccessLink href="/shop">
            {done.role === "seller" ? "Gaan na winkel" : "Begin inkopies"}
          </SuccessLink>
        </Success>
      </>
    );
  }

  return (
    <>
      <Title>Registreer</Title>
      <Subtitle>
        Kies wat jy wil doen. Dit vat minder as ’n minuut op jou foon.
      </Subtitle>

      <RoleGrid>
        <RoleButton
          type="button"
          $active={role === "customer"}
          onClick={() => setRole("customer")}
        >
          <RoleTitle>Ek koop</RoleTitle>
          <RoleHint>Stoor jou besonderhede vir vinniger afreken.</RoleHint>
        </RoleButton>
        <RoleButton
          type="button"
          $active={role === "seller"}
          onClick={() => setRole("seller")}
        >
          <RoleTitle>Ek verkoop</RoleTitle>
          <RoleHint>Skep jou plaas/handelsmerk en begin lys.</RoleHint>
        </RoleButton>
      </RoleGrid>

      <Card>
        <Form onSubmit={submit}>
          {error ? <ErrorMsg role="alert">{error}</ErrorMsg> : null}

          <Field>
            <Label htmlFor="reg-name">Naam</Label>
            <Input
              id="reg-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jou volle naam"
              required
            />
          </Field>

          <Field>
            <Label htmlFor="reg-phone">Foon</Label>
            <Input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                resetVerification();
              }}
              placeholder="Bv. 082 123 4567"
              required
            />
            <SecondaryBtn
              type="button"
              onClick={() => void sendOtp()}
              disabled={sendingOtp || !phoneNorm}
            >
              {sendingOtp ? "Stuur kode…" : "Stuur verifikasiekode"}
            </SecondaryBtn>
            <Hint>
              Jy kry ’n 6-syfer kode. Ons gebruik dit om jou nommer te bevestig.
            </Hint>
          </Field>

          {codeSent ? (
            <Field>
              <Label htmlFor="reg-otp">6-syfer kode</Label>
              <Input
                id="reg-otp"
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
                {verifyingOtp ? "Bevestig…" : "Bevestig foon"}
              </SecondaryBtn>
            </Field>
          ) : null}

          {role === "seller" ? (
            <>
              <Field>
                <Label htmlFor="reg-brandName">Handelsnaam</Label>
                <Input
                  id="reg-brandName"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Bv. Plaas Botha"
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="reg-brandColor">Handelsmerk kleur</Label>
                <ColorRow>
                  <ColorSwatch
                    id="reg-brandColor"
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    aria-label="Kies handelsmerk kleur"
                  />
                  <Input
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#2E5E3E"
                    inputMode="text"
                  />
                </ColorRow>
                <Hint>
                  Hierdie kleur word later gebruik vir jou winkel en etikette.
                </Hint>
              </Field>

              <Field>
                <Label htmlFor="reg-logoFile">Logo (opsioneel)</Label>
                <FileInput
                  id="reg-logoFile"
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setError(null);
                    void handleLogoFile(e.target.files?.[0] ?? null);
                  }}
                />
                <FileActions>
                  <TinyBtn
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    Kies lêer
                  </TinyBtn>
                  <TinyBtn
                    type="button"
                    onClick={() => {
                      setLogoUrl("");
                      if (logoInputRef.current) logoInputRef.current.value = "";
                    }}
                    disabled={!logoUrl}
                  >
                    Verwyder
                  </TinyBtn>
                </FileActions>
                {logoUrl ? (
                  <LogoPreview aria-label="Logo preview">
                    <PreviewImg src={logoUrl} alt="Logo preview" />
                  </LogoPreview>
                ) : null}
                <Hint>
                  Ons stoor dit vir nou as ’n eenvoudige prent (maks 2MB). Jy
                  kan dit later verander.
                </Hint>
              </Field>
            </>
          ) : null}

          <PrimaryBtn type="submit" disabled={submitting || !phoneVerified}>
            {submitting
              ? "Besig…"
              : role === "seller"
                ? "Skep verkoperprofiel"
                : "Skep rekening"}
          </PrimaryBtn>
        </Form>
      </Card>
    </>
  );
}
