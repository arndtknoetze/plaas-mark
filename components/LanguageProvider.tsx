"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type Language, translations } from "@/lib/i18n";

const STORAGE_KEY = "plaasmark-lang";
const COOKIE_KEY = "plaasmark-lang";
const LANG_EVENT = "plaasmark-lang";

export type TranslationKey = keyof (typeof translations)["af"];

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "af";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "af" || raw === "en") return raw;
  } catch {
    /* ignore */
  }
  return "af";
}

function writeLanguageCookie(lang: Language) {
  try {
    const maxAge = 60 * 60 * 24 * 365; // 1 year
    document.cookie = `${COOKIE_KEY}=${lang}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function LanguageProvider({
  children,
  initialLanguage = "af",
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    const sync = () => {
      const next = readStoredLanguage();
      setLanguageState(next);
      writeLanguageCookie(next);
    };
    sync();
    window.addEventListener(LANG_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(LANG_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      writeLanguageCookie(lang);
      window.dispatchEvent(new Event(LANG_EVENT));
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const raw = String(translations[language][key]);
      if (!params) return raw;
      return Object.entries(params).reduce<string>((acc, [k, v]) => {
        return acc.replaceAll(`{${k}}`, String(v));
      }, raw);
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
