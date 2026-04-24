"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useState } from "react";
import {
  ServerStyleSheet,
  StyleSheetManager,
  ThemeProvider,
} from "styled-components";
import { CartProvider } from "@/lib/cart-context";
import { GlobalStyles } from "@/styles/global";
import { theme } from "@/styles/theme";

export function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement();
    sheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") {
    return (
      <ThemeProvider theme={theme}>
        <CartProvider>
          <GlobalStyles />
          {children}
        </CartProvider>
      </ThemeProvider>
    );
  }

  return (
    <StyleSheetManager sheet={sheet.instance}>
      <ThemeProvider theme={theme}>
        <CartProvider>
          <GlobalStyles />
          {children}
        </CartProvider>
      </ThemeProvider>
    </StyleSheetManager>
  );
}
