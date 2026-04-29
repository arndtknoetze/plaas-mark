"use client";

import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

type StickerStore = {
  name: string;
  slug: string;
  brandColor?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  phoneNumber?: string | null;
  locationSlug?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  store: StickerStore | null;
};

type StickerOptions = {
  showLogo: boolean;
  showStoreName: boolean;
  showQr: boolean;
  showDescription: boolean;
  showPhoneNumber: boolean;
};

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 14px;

  @media (min-width: 720px) {
    align-items: center;
    padding: 18px;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 980px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.18),
    0 1px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const Top = styled.div`
  padding: 16px 16px 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.2;
  font-weight: 950;
  color: ${({ theme }) => theme.colors.textDark};
`;

const SubTitle = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.5;
  font-size: 0.92rem;
`;

const Close = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textLight};

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textDark};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Body = styled.div`
  padding: 0 16px 16px;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 12px 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 880px) {
    grid-template-columns: 340px 1fr;
    align-items: start;
  }
`;

const Panel = styled.div`
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: ${({ theme }) => theme.colors.background};
  padding: 12px;
`;

const PanelTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 0.9rem;
  font-weight: 950;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textDark};
`;

const OptionRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #ffffff;

  & + & {
    margin-top: 10px;
  }
`;

const OptionText = styled.div`
  font-size: 0.92rem;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Toggle = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const PrimaryBtn = styled.button`
  min-height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.05s ease,
    opacity 0.15s ease;

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const SecondaryBtn = styled.button`
  min-height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: #ffffff;
  color: ${({ theme }) => theme.colors.textDark};
  font-weight: 900;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Hint = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.45;
`;

const PreviewWrap = styled.div`
  display: grid;
  place-items: center;
  padding: 14px;
`;

const StickerPreview = styled.div<{ $accent?: string | null }>`
  width: 300px;
  height: 300px;
  background: #ffffff;
  border-radius: 22px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 10px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  position: relative;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  &:after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: 22px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.03);
  }
`;

const StickerTop = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StickerLogo = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  object-fit: cover;
`;

const StickerMid = styled.div`
  width: 100%;
  text-align: center;
  padding: 8px 0 0;
`;

const StickerName = styled.div<{ $accent?: string | null }>`
  font-size: 1.1rem;
  font-weight: 980;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.15;
  padding: 0 6px;
  word-break: break-word;

  span {
    display: inline-block;
    border-bottom: 3px solid
      ${({ $accent }) =>
        $accent && /^#[0-9a-fA-F]{6}$/.test($accent) ? $accent : "transparent"};
    padding-bottom: 2px;
  }
`;

const StickerQr = styled.div`
  display: grid;
  place-items: center;
  padding: 10px 0 4px;
`;

const StickerBottom = styled.div`
  width: 100%;
  text-align: center;
  padding-top: 6px;
`;

const StickerSmall = styled.div`
  font-size: 0.72rem;
  line-height: 1.25;
  color: rgba(0, 0, 0, 0.62);
  padding: 0 6px;
  word-break: break-word;
`;

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function sanitizeFileName(raw: string) {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "sticker";
}

async function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  fileName: string,
) {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Could not export PNG.");

  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function StickerGeneratorModal({ open, onClose, store }: Props) {
  const [opts, setOpts] = useState<StickerOptions>({
    showLogo: true,
    showStoreName: true,
    showQr: true,
    showDescription: true,
    showPhoneNumber: true,
  });
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [previewReady, setPreviewReady] = useState(false);

  const setPreviewEl = useCallback((el: HTMLDivElement | null) => {
    previewRef.current = el;
    setPreviewReady(Boolean(el));
  }, []);

  const qrValue = (() => {
    if (!store?.slug) return null;
    const loc = store.locationSlug?.trim();
    return loc ? `/${loc}/store/${store.slug}` : `/store/${store.slug}`;
  })();

  const safeStoreName = store?.name?.trim() || "Store";
  const safeDescription = store?.description?.trim() || "";
  const safePhone = store?.phoneNumber?.trim() || "";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Backdrop
      role="dialog"
      aria-modal="true"
      aria-label="Generate sticker"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card>
        <Top>
          <TitleBlock>
            <Title>Generate Sticker</Title>
            <SubTitle>
              Toggle fields, preview, then download a print-ready PNG.
            </SubTitle>
          </TitleBlock>
          <Close type="button" onClick={onClose} aria-label="Close">
            <XIcon />
          </Close>
        </Top>

        <Body>
          <Divider />

          <Grid>
            <Panel>
              <PanelTitle>Content</PanelTitle>
              <OptionRow>
                <OptionText>Show Logo</OptionText>
                <Toggle
                  type="checkbox"
                  checked={opts.showLogo}
                  onChange={(e) =>
                    setOpts((p) => ({ ...p, showLogo: e.target.checked }))
                  }
                />
              </OptionRow>
              <OptionRow>
                <OptionText>Show Store Name</OptionText>
                <Toggle
                  type="checkbox"
                  checked={opts.showStoreName}
                  onChange={(e) =>
                    setOpts((p) => ({ ...p, showStoreName: e.target.checked }))
                  }
                />
              </OptionRow>
              <OptionRow>
                <OptionText>Show QR Code</OptionText>
                <Toggle
                  type="checkbox"
                  checked={opts.showQr}
                  onChange={(e) =>
                    setOpts((p) => ({ ...p, showQr: e.target.checked }))
                  }
                />
              </OptionRow>
              <OptionRow>
                <OptionText>Show Description</OptionText>
                <Toggle
                  type="checkbox"
                  checked={opts.showDescription}
                  onChange={(e) =>
                    setOpts((p) => ({
                      ...p,
                      showDescription: e.target.checked,
                    }))
                  }
                />
              </OptionRow>
              <OptionRow>
                <OptionText>Show Phone Number</OptionText>
                <Toggle
                  type="checkbox"
                  checked={opts.showPhoneNumber}
                  onChange={(e) =>
                    setOpts((p) => ({
                      ...p,
                      showPhoneNumber: e.target.checked,
                    }))
                  }
                />
              </OptionRow>

              <Divider />

              <FooterRow>
                <Hint>
                  Export is client-side. For best print quality, the PNG is
                  rendered at high resolution.
                </Hint>
                <ButtonRow>
                  <SecondaryBtn type="button" onClick={onClose}>
                    Close
                  </SecondaryBtn>
                  <PrimaryBtn
                    type="button"
                    disabled={!store || !previewReady || exporting}
                    onClick={() => {
                      if (!store || !previewRef.current) return;
                      setExporting(true);
                      void (async () => {
                        try {
                          const canvas = await html2canvas(
                            previewRef.current!,
                            {
                              backgroundColor: "#ffffff",
                              scale: 4,
                              useCORS: true,
                            },
                          );
                          await downloadCanvasAsPng(
                            canvas,
                            `${sanitizeFileName(safeStoreName)}-sticker.png`,
                          );
                        } finally {
                          setExporting(false);
                        }
                      })();
                    }}
                  >
                    {exporting ? "Exporting…" : "Download PNG"}
                  </PrimaryBtn>
                </ButtonRow>
              </FooterRow>
            </Panel>

            <Panel>
              <PanelTitle>Live preview</PanelTitle>
              <PreviewWrap>
                <StickerPreview ref={setPreviewEl} $accent={store?.brandColor}>
                  <StickerTop>
                    {opts.showLogo ? (
                      <StickerLogo
                        src={store?.logoUrl || "/logo.png"}
                        crossOrigin="anonymous"
                        alt={`${safeStoreName} logo`}
                      />
                    ) : (
                      <div />
                    )}
                  </StickerTop>

                  <StickerMid>
                    {opts.showStoreName ? (
                      <StickerName $accent={store?.brandColor}>
                        <span>{safeStoreName}</span>
                      </StickerName>
                    ) : null}
                  </StickerMid>

                  <StickerQr>
                    {opts.showQr && qrValue ? (
                      <QRCodeCanvas
                        value={qrValue}
                        size={112}
                        includeMargin
                        level="M"
                      />
                    ) : (
                      <div />
                    )}
                  </StickerQr>

                  <StickerBottom>
                    {opts.showDescription && safeDescription ? (
                      <StickerSmall>{safeDescription}</StickerSmall>
                    ) : null}
                    {opts.showPhoneNumber && safePhone ? (
                      <StickerSmall
                        style={{ marginTop: safeDescription ? 6 : 0 }}
                      >
                        {safePhone}
                      </StickerSmall>
                    ) : null}
                  </StickerBottom>
                </StickerPreview>
              </PreviewWrap>
            </Panel>
          </Grid>
        </Body>
      </Card>
    </Backdrop>
  );
}
