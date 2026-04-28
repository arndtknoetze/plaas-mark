"use client";

import styled from "styled-components";
import { useLanguage } from "@/lib/useLanguage";

const ToggleWrap = styled.div`
  display: inline-flex;
  align-items: stretch;
  border-radius: 10px;
  border: 1px solid #d8d8d4;
  overflow: hidden;
  background: #ffffff;
  flex-shrink: 0;
`;

const ToggleBtn = styled.button<{ $active: boolean }>`
  min-height: 36px;
  min-width: 40px;
  padding: 0 10px;
  border: none;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  color: ${({ $active, theme }) =>
    $active ? "#ffffff" : theme.colors.textDark};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "transparent"};
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.secondary : theme.colors.background};
    color: ${({ $active, theme }) =>
      $active ? "#ffffff" : theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
    position: relative;
    z-index: 1;
  }
`;

const Divider = styled.span`
  width: 1px;
  align-self: stretch;
  background: #d8d8d4;
  flex-shrink: 0;
`;

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <ToggleWrap role="group" aria-label="Language">
      <ToggleBtn
        type="button"
        $active={language === "af"}
        aria-pressed={language === "af"}
        onClick={() => setLanguage("af")}
      >
        AF
      </ToggleBtn>
      <Divider aria-hidden />
      <ToggleBtn
        type="button"
        $active={language === "en"}
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
      >
        EN
      </ToggleBtn>
    </ToggleWrap>
  );
}
