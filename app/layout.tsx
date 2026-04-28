import type { Metadata } from "next";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Shell } from "@/components/Shell";
import { getPublicLocationOrNull } from "@/lib/location";
import { StyledComponentsRegistry } from "@/lib/styled-registry";
import { theme } from "@/styles/theme";
import type { Language } from "@/lib/i18n";

function getRequestOriginFromHeaders(h: Headers) {
  const proto = (h.get("x-forwarded-proto") || "https").split(",")[0]?.trim();
  const host = (h.get("x-forwarded-host") || h.get("host") || "").trim();
  if (!host) return null;
  return `${proto}://${host}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const location = await getPublicLocationOrNull();
  const h = await headers();

  const globalTitle = "PlaasMark – Aanlyn Boeremark";
  const globalDescription =
    "Koop vars, tuisgemaakte produkte direk van plaaslike verkopers in jou dorp. PlaasMark is 'n eenvoudige aanlyn boeremark vir klein entrepreneurs.";

  const title = location
    ? `PlaasMark ${location.name} – Plaaslike Produkte en Bestellings`
    : globalTitle;

  const description = location
    ? `Koop vars produkte, gebak en meer van plaaslike verkopers in ${location.name}. Ondersteun klein besighede met PlaasMark.`
    : globalDescription;

  const requestOrigin = getRequestOriginFromHeaders(h);
  const canonicalOrigin =
    location && requestOrigin?.includes("plaas-mark.co.za")
      ? `https://${location.slug}.plaas-mark.co.za`
      : requestOrigin || "https://plaas-mark.co.za";

  return {
    title,
    description,
    metadataBase: new URL(canonicalOrigin),
    openGraph: {
      title,
      description,
      url: canonicalOrigin,
      siteName: "PlaasMark",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
    applicationName: "PlaasMark",
    appleWebApp: {
      capable: true,
      title: "PlaasMark",
      statusBarStyle: "default",
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
      apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const location = await getPublicLocationOrNull();
  const h = await headers();
  const shell = h.get("x-app-shell") === "admin" ? "admin" : "site";
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("plaasmark-lang")?.value ?? "af";
  const initialLanguage: Language = rawLang === "en" ? "en" : "af";

  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: theme.colors.background,
        }}
      >
        <StyledComponentsRegistry>
          <LanguageProvider initialLanguage={initialLanguage}>
            <Shell location={location} variant={shell}>
              {children}
            </Shell>
          </LanguageProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
