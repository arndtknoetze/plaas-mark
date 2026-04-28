"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { LanguageToggle } from "@/components/LanguageToggle";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const Root = styled.div`
  min-height: 100vh;
  height: 100vh;
  display: flex;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textDark};
`;

const SidebarWrap = styled.aside<{ $open: boolean }>`
  width: 240px;
  flex: 0 0 240px;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  gap: 12px;

  @media (max-width: 880px) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 80;
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.16);
    transform: translateX(${({ $open }) => ($open ? "0" : "-105%")});
    transition: transform 0.18s ease;
  }
`;

const Overlay = styled.button<{ $show: boolean }>`
  display: none;

  @media (max-width: 880px) {
    display: ${({ $show }) => ($show ? "block" : "none")};
    position: fixed;
    inset: 0;
    z-index: 70;
    border: none;
    background: rgba(0, 0, 0, 0.32);
    cursor: pointer;
  }
`;

const Brand = styled.div`
  padding: 10px 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const BrandTop = styled.div`
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 950;
  color: ${({ theme }) => theme.colors.textLight};
`;

const BrandBottom = styled.div`
  margin-top: 4px;
  font-size: 1.05rem;
  font-weight: 980;
  letter-spacing: -0.03em;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const navLinkActive = css`
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.12);
  color: ${({ theme }) => theme.colors.primary};
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 10px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textDark};
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.12);
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }

  ${({ $active }) => ($active ? navLinkActive : "")};
`;

const NavIcon = styled.span`
  width: 22px;
  height: 22px;
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  color: currentColor;
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  display: grid;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const ContentWrap = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

const TopBarInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;

  @media (min-width: 1024px) {
    padding-left: 24px;
    padding-right: 24px;
  }
`;

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const Burger = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: none;
  color: ${({ theme }) => theme.colors.textDark};

  @media (max-width: 880px) {
    display: inline-grid;
    place-items: center;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const PageTitle = styled.div`
  font-weight: 980;
  letter-spacing: -0.03em;
  font-size: 1.1rem;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.textDark};
`;

const MetaRow = styled.div`
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.85rem;
`;

const Dot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.22);
`;

const TopRight = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const UserPill = styled.div`
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.08);
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textDark};
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 420px) {
    display: none;
  }
`;

const Main = styled.main`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

const MainInner = styled.div`
  padding: 24px 16px;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 1024px) {
    padding-left: 24px;
    padding-right: 24px;
  }
`;

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconReceipt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3h10v18l-2-1-3 1-3-1-2 1V3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 8h6M9 12h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconStore() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 9l2-5h12l2 5v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6 22V15h12v7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 8l-9 5-9-5 9-5 9 5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M3 8v8l9 5 9-5V8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4 21a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 19V5M4 19h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 15v-3M12 15V8M16 15v-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCog() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 15a7.97 7.97 0 0 0 .1-1 7.97 7.97 0 0 0-.1-1l2-1.5-2-3.5-2.4.8a8.2 8.2 0 0 0-1.7-1l-.4-2.5H11l-.4 2.5a8.2 8.2 0 0 0-1.7 1l-2.4-.8-2 3.5L6.5 13a7.97 7.97 0 0 0-.1 1c0 .34.03.67.1 1l-2 1.5 2 3.5 2.4-.8c.53.4 1.1.73 1.7 1l.4 2.5h4l.4-2.5c.6-.27 1.17-.6 1.7-1l2.4.8 2-3.5-2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <IconGrid /> },
  { href: "/admin/orders", label: "Orders", icon: <IconReceipt /> },
  { href: "/admin/stores", label: "Stores", icon: <IconStore /> },
  { href: "/admin/products", label: "Products", icon: <IconBox /> },
  { href: "/admin/sponsors", label: "Sponsors", icon: <IconUsers /> },
  { href: "/admin/analytics", label: "Analytics", icon: <IconChart /> },
  { href: "/admin/settings", label: "Settings", icon: <IconCog /> },
];

function titleFromPath(pathname: string) {
  const exact = NAV.find((n) => n.href === pathname);
  if (exact) return exact.label;
  const prefix = NAV.find(
    (n) => n.href !== "/admin" && pathname.startsWith(n.href),
  );
  return prefix?.label ?? "Admin";
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardLayout({
  children,
  locationName,
  userName,
  sidebarFooter,
}: {
  children: React.ReactNode;
  locationName: string;
  userName: string;
  sidebarFooter?: React.ReactNode;
}) {
  const pathname = usePathname() || "/admin";
  const pageTitle = useMemo(() => titleFromPath(pathname), [pathname]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Root>
      <Overlay
        type="button"
        aria-label="Close menu"
        $show={sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      <SidebarWrap $open={sidebarOpen} aria-label="Admin navigation">
        <Brand>
          <BrandTop>PlaasMark</BrandTop>
          <BrandBottom>Admin</BrandBottom>
        </Brand>

        <Nav>
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              $active={isActive(pathname, item.href)}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon aria-hidden>{item.icon}</NavIcon>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </Nav>

        {sidebarFooter ? <SidebarFooter>{sidebarFooter}</SidebarFooter> : null}
      </SidebarWrap>

      <ContentWrap>
        <TopBar>
          <TopBarInner>
            <TopLeft>
              <Burger
                type="button"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
              >
                <IconMenu />
              </Burger>
              <TitleBlock>
                <PageTitle>{pageTitle}</PageTitle>
                <MetaRow>
                  <span>{locationName}</span>
                  <Dot aria-hidden />
                  <span>Admin</span>
                </MetaRow>
              </TitleBlock>
            </TopLeft>

            <TopRight>
              <UserPill title={userName}>{userName}</UserPill>
              <LanguageToggle />
            </TopRight>
          </TopBarInner>
        </TopBar>

        <Main>
          <MainInner>{children}</MainInner>
        </Main>
      </ContentWrap>
    </Root>
  );
}
