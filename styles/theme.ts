export const theme = {
  colors: {
    primary: "#2E5E3E",
    secondary: "#4C7A4D",
    background: "#F5F5F0",
    accent: "#E89B2C",
    textDark: "#1A1A1A",
    textLight: "#6B6B6B",
  },
} as const;

export type AppTheme = typeof theme;
