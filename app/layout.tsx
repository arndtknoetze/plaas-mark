import type { Metadata } from "next";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Shell } from "@/components/Shell";
import { getPublicLocationOrNull } from "@/lib/location";
import { StyledComponentsRegistry } from "@/lib/styled-registry";
import { theme } from "@/styles/theme";

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

  return (
    <html lang="en">
      <body style={{ backgroundColor: theme.colors.background }}>
        <StyledComponentsRegistry>
          <LanguageProvider>
            <Shell location={location}>{children}</Shell>
          </LanguageProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
