"use client";

import { createGlobalStyle } from "styled-components";

const systemStack = [
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Roboto",
  '"Helvetica Neue"',
  "Arial",
  "sans-serif",
].join(", ");

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :root {
    --pm-header-offset: 72px;
  }

  @media (min-width: 768px) {
    :root {
      --pm-header-offset: 80px;
    }
  }

  * {
    margin: 0;
  }

  html {
    height: 100%;
    -webkit-text-size-adjust: 100%;
  }

  html,
  body {
    max-width: 100vw;
    overflow-x: hidden;
  }

  body {
    min-height: 100%;
    background-color: ${({ theme }) => theme.colors.background};
    background-image: none;
    color: ${({ theme }) => theme.colors.textDark};
    font-family: ${systemStack};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background-color: ${({ theme }) => theme.colors.background};
    background-image: url("/background-mobile.png");
    background-repeat: no-repeat;
    background-position: center top;
    background-size: cover;
  }

  @media (min-width: 768px) {
    body::before {
      background-image: url("/background-desktop.png");
    }
  }

  img,
  picture,
  video,
  canvas,
  svg {
    display: block;
    max-width: 100%;
  }

  input,
  button,
  textarea,
  select {
    font: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;
