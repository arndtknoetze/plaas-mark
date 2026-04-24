import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: theme.colors.background }}>
        <StyledComponentsRegistry>
          <Shell>{children}</Shell>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
