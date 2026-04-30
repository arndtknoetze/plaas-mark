"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import styled from "styled-components";
import { useToast } from "@/components/ToastProvider";
import { fileToCroppedDataUrl } from "@/lib/image-crop";
import { useLanguage } from "@/lib/useLanguage";
import { loadStoredSession } from "@/lib/session-storage";
import { useResolvedLocationSlug } from "@/lib/useResolvedLocationSlug";

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Lead = styled.p`
  margin: 0 0 16px;
  font-size: 0.95rem;
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
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(46, 94, 62, 0.15);
  }
`;

const FileInput = styled.input`
  width: 100%;
  min-height: 44px;
  font-size: 0.9rem;
`;

const Preview = styled.div`
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  justify-content: center;
  min-height: 120px;
  align-items: center;
`;

const PreviewImg = styled.img`
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
`;

const ErrorMsg = styled.p`
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #8a1c1c;
  background: #fdeaea;
`;

const PrimaryBtn = styled.button`
  min-height: 52px;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  color: #fff;
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const SecondaryBtn = styled.button`
  min-height: 48px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  background: #fff;
  cursor: pointer;
`;

const StepDots = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const Dot = styled.span<{ $active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "#ddd"};
`;

const SuccessIcon = styled.div`
  font-size: 3rem;
  text-align: center;
  margin-bottom: 8px;
`;

export function OnboardingClient() {
  const { language } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const locationSlug = useResolvedLocationSlug();
  const shopHref = locationSlug ? `/${locationSlug}/shop` : "/";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [storeName, setStoreName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);

  const [storeId, setStoreId] = useState<string | null>(null);

  const [productTitle, setProductTitle] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState("");
  const productImgRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLogo = async (file: File | null) => {
    if (!file) {
      setLogoUrl("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error(language === "af" ? "Kies 'n beeld." : "Choose an image.");
      return;
    }
    try {
      const url = await fileToCroppedDataUrl(file, {
        aspect: "square",
        maxSize: 512,
        mimeType: "image/webp",
        quality: 0.9,
      });
      setLogoUrl(url);
    } catch {
      toast.error(
        language === "af" ? "Kon nie logo laai nie." : "Could not load logo.",
      );
    }
  };

  const handleProductImage = async (file: File | null) => {
    if (!file) {
      setProductImage("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error(language === "af" ? "Kies 'n beeld." : "Choose an image.");
      return;
    }
    try {
      const url = await fileToCroppedDataUrl(file, {
        aspect: "productPortrait",
        maxSize: 900,
        mimeType: "image/webp",
        quality: 0.85,
      });
      setProductImage(url);
    } catch {
      toast.error(
        language === "af" ? "Kon nie foto laai nie." : "Could not load photo.",
      );
    }
  };

  const createStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = storeName.trim();
    if (!name) {
      setError(
        language === "af"
          ? "Vul jou winkel se naam in."
          : "Enter your shop name.",
      );
      return;
    }
    if (!loadStoredSession()) {
      router.replace("/register");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/stores/my", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Could not create store.";
        throw new Error(msg);
      }
      const sid =
        data &&
        typeof data === "object" &&
        "storeId" in data &&
        typeof (data as { storeId: unknown }).storeId === "string"
          ? (data as { storeId: string }).storeId
          : null;
      if (!sid) throw new Error("Invalid response.");

      if (logoUrl) {
        const patch = await fetch(`/api/stores/${encodeURIComponent(sid)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logoUrl }),
        });
        if (!patch.ok) {
          const err: unknown = await patch.json().catch(() => null);
          const msg =
            err &&
            typeof err === "object" &&
            "error" in err &&
            typeof (err as { error: unknown }).error === "string"
              ? (err as { error: string }).error
              : "Could not save logo.";
          throw new Error(msg);
        }
      }

      setStoreId(sid);
      setStep(2);
      toast.success(language === "af" ? "Winkel geskep!" : "Shop created!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!storeId) return;
    const title = productTitle.trim();
    const price = Number(productPrice.replace(",", "."));
    if (!title) {
      setError(
        language === "af" ? "Vul die produknaam in." : "Enter a product name.",
      );
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError(
        language === "af" ? "Geldige prys asseblief." : "Enter a valid price.",
      );
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          title,
          price,
          ...(productImage ? { image: productImage } : {}),
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
            : "Could not add product.";
        throw new Error(msg);
      }
      setStep(3);
      toast.success(language === "af" ? "Produk bygevoeg!" : "Product added!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <StepDots>
        <Dot $active={step >= 1} />
        <Dot $active={step >= 2} />
        <Dot $active={step >= 3} />
      </StepDots>

      {step === 1 ? (
        <>
          <Title>{language === "af" ? "Jou winkel" : "Your shop"}</Title>
          <Lead>
            {language === "af"
              ? "Kies 'n naam en voeg optioneel 'n logo by."
              : "Pick a name and optionally add a logo."}
          </Lead>
          <Card>
            <Form onSubmit={createStore}>
              {error ? <ErrorMsg role="alert">{error}</ErrorMsg> : null}
              <Field>
                <Label htmlFor="ob-store-name">
                  {language === "af" ? "Winkelnaam" : "Shop name"}
                </Label>
                <Input
                  id="ob-store-name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder={
                    language === "af" ? "Byv. Boerekos" : "e.g. Farm Fresh"
                  }
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="ob-logo">
                  {language === "af" ? "Logo (opsioneel)" : "Logo (optional)"}
                </Label>
                <FileInput
                  id="ob-logo"
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handleLogo(e.target.files?.[0] ?? null)}
                />
                {logoUrl ? (
                  <Preview>
                    <PreviewImg src={logoUrl} alt="" />
                  </Preview>
                ) : null}
              </Field>
              <PrimaryBtn type="submit" disabled={busy}>
                {busy ? "…" : language === "af" ? "Volgende" : "Next"}
              </PrimaryBtn>
            </Form>
          </Card>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <Title>{language === "af" ? "Eerste produk" : "First product"}</Title>
          <Lead>
            {language === "af"
              ? "Voeg een produk by om te begin verkoop."
              : "Add one product to start selling."}
          </Lead>
          <Card>
            <Form onSubmit={createProduct}>
              {error ? <ErrorMsg role="alert">{error}</ErrorMsg> : null}
              <Field>
                <Label htmlFor="ob-product-title">
                  {language === "af" ? "Naam" : "Name"}
                </Label>
                <Input
                  id="ob-product-title"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder={
                    language === "af"
                      ? "Byv. Vars tamaties"
                      : "e.g. Fresh tomatoes"
                  }
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="ob-price">
                  {language === "af" ? "Prys (ZAR)" : "Price (ZAR)"}
                </Label>
                <Input
                  id="ob-price"
                  inputMode="decimal"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="29.99"
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="ob-product-img">
                  {language === "af" ? "Foto (opsioneel)" : "Photo (optional)"}
                </Label>
                <FileInput
                  id="ob-product-img"
                  ref={productImgRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    void handleProductImage(e.target.files?.[0] ?? null)
                  }
                />
                {productImage ? (
                  <Preview>
                    <PreviewImg src={productImage} alt="" />
                  </Preview>
                ) : null}
              </Field>
              <PrimaryBtn type="submit" disabled={busy}>
                {busy ? "…" : language === "af" ? "Volgende" : "Next"}
              </PrimaryBtn>
              <SecondaryBtn
                type="button"
                onClick={() => setStep(1)}
                disabled={busy}
              >
                {language === "af" ? "Terug" : "Back"}
              </SecondaryBtn>
            </Form>
          </Card>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <SuccessIcon aria-hidden>✓</SuccessIcon>
          <Title>
            {language === "af" ? "Jy is gereed!" : "You're all set!"}
          </Title>
          <Lead>
            {language === "af"
              ? "Jou winkel en eerste produk is reg. Kom ons bring kopers."
              : "Your shop and first product are live. Let’s get customers."}
          </Lead>
          <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <PrimaryBtn type="button" onClick={() => router.push("/account")}>
              {language === "af" ? "Na dashboard" : "Go to dashboard"}
            </PrimaryBtn>
            <SecondaryBtn type="button" onClick={() => router.push(shopHref)}>
              {language === "af" ? "Bekyk winkel" : "View shop"}
            </SecondaryBtn>
            <p style={{ margin: 0, fontSize: "0.88rem", textAlign: "center" }}>
              <Link href="/account/stores">Manage stores</Link>
            </p>
          </Card>
        </>
      ) : null}
    </>
  );
}
