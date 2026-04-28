import type { Metadata } from "next";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Shell } from "@/components/Shell";
import { getPublicLocationOrNull } from "@/lib/location";
import { StyledComponentsRegistry } from "@/lib/styled-registry";
import { theme } from "@/styles/theme";
import type { Language } from "@/lib/i18n";

export const metadata: Metadata = {
  title: {
    default: "PlaasMark",
    template: "%s | PlaasMark",
  },
  description: "PlaasMark",
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
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png" }],
  },
};

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
