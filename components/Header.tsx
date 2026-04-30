"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Container } from "@/components/Container";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useToast } from "@/components/ToastProvider";
import { useCart } from "@/lib/cart-context";
import { useLanguage } from "@/lib/useLanguage";
import {
  clearStoredSession,
  loadStoredSession,
  sessionContactLabel,
  type StoredSession,
} from "@/lib/session-storage";
import type { PublicLocation } from "@/lib/location";
import { useResolvedLocationSlug } from "@/lib/useResolvedLocationSlug";

const Bar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.04);
`;

const Inner = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 56px;
  padding-top: 8px;
  padding-bottom: 8px;

  @media (min-width: 768px) {
    min-height: 64px;
  }
`;

const BrandCluster = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  flex: 1 1 auto;
`;

const Brand = styled(Link)`
  position: relative;
  display: block;
  height: 40px;
  width: 160px;
  flex-shrink: 1;
  text-decoration: none;

  @media (min-width: 375px) {
    width: 180px;
  }

  @media (min-width: 420px) {
    width: 198px;
  }

  @media (min-width: 768px) {
    height: 46px;
    width: 228px;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textDark};
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const MenuWrap = styled.div`
  position: relative;
`;

const Menu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  min-width: 220px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 6px;
  z-index: 60;
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textDark};
  font-size: 0.9rem;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textDark};
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const MenuMeta = styled.div`
  padding: 10px 12px 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background};
  margin-bottom: 6px;
`;

const MenuName = styled.div`
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.2;
`;

const MenuPhone = styled.div`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: 2px;
`;

const MenuDivider = styled.div`
  height: 1px;
  margin: 6px 6px;
  background: ${({ theme }) => theme.colors.background};
`;

const MenuGroupLabel = styled.div`
  margin: 8px 10px 4px;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textLight};
`;

const CartLink = styled(Link)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.textDark};
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

const BellLink = styled(CartLink)``;

const CartBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.accent};
`;

const NotifBadge = styled(CartBadge)`
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  font-size: 0.625rem;
`;

function BasketIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 -3 32 32"
      fill="currentColor"
      aria-hidden
    >
      <path
        d="M439.429,738 L434,738 L434,734 L440,734 L439.429,738 L439.429,738 Z M438.571,744 L434,744 L434,740 L439.143,740 L438.571,744 L438.571,744 Z M438,748 C438,749.104 437.104,750 436,750 L434,750 L434,746 L438.286,746 L438,748 L438,748 Z M424,734 L432,734 L432,738 L424,738 L424,734 Z M424,740 L432,740 L432,744 L424,744 L424,740 Z M424,746 L432,746 L432,750 L424,750 L424,746 Z M422,738 L416.286,738 L416,734 L422,734 L422,738 L422,738 Z M422,744 L416.714,744 L416.429,740 L422,740 L422,744 L422,744 Z M422,750 L419,750 C417.896,750 417,749.104 417,748 L416.857,746 L422,746 L422,750 L422,750 Z M443,732 L436.474,732 L438.5,728 L441,728 C441.553,728 442,727.553 442,727 C442,726.447 441.553,726 441,726 L437,726 L433.916,732 L422.168,732 L419,726 L415,726 C414.447,726 414,726.447 414,727 C414,727.553 414.447,728 415,728 L417.5,728 L419.646,732 L413,732 C412.447,732 412,732.448 412,733 C412,733.553 412.447,734 413,734 L414,734 L415,748 C415,750.209 416.791,752 419,752 L436,752 C438.209,752 440,750.209 440,748 L442,734 L443,734 C443.553,734 444,733.553 444,733 C444,732.448 443.553,732 443,732 L443,732 Z"
        transform="translate(-412 -726)"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Header({ location }: { location: PublicLocation | null }) {
  const { t } = useLanguage();
  const router = useRouter();
  const resolvedLocation = useResolvedLocationSlug();
  const locationPrefix = resolvedLocation ? `/${resolvedLocation}` : "";
  const locationQuery = resolvedLocation
    ? `&location=${encodeURIComponent(resolvedLocation)}`
    : "";
  const toast = useToast();
  const { items } = useCart();
  const count = items.reduce((sum, line) => sum + line.quantity, 0);
  const [session, setSession] = useState<StoredSession | null>(() =>
    loadStoredSession(),
  );
  const [adminRoutesEnabled, setAdminRoutesEnabled] = useState(false);
  const [storesLoaded, setStoresLoaded] = useState(false);
  const [hasNoStoreInArea, setHasNoStoreInArea] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "plaasmark-session") {
        setSession(loadStoredSession());
      }
    };
    const onSession = () => setSession(loadStoredSession());
    window.addEventListener("storage", onStorage);
    window.addEventListener("plaasmark-session", onSession);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("plaasmark-session", onSession);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then((r) => r.json())
      .then((d: unknown) => {
        if (cancelled || !d || typeof d !== "object") return;
        const v = (d as { adminRoutesEnabled?: unknown }).adminRoutesEnabled;
        if (typeof v === "boolean") setAdminRoutesEnabled(v);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    fetch(`/api/stores/my${locationQuery.replace(/^&/, "?")}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        const stores =
          data && typeof data === "object" && "stores" in data
            ? (data as { stores: unknown }).stores
            : null;
        setHasNoStoreInArea(Array.isArray(stores) && stores.length === 0);
        setStoresLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setStoresLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [locationQuery, session]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    const loadUnread = async () => {
      try {
        const res = await fetch("/api/notifications/unread-count", {
          cache: "no-store",
        });
        const data = (await res.json().catch(() => ({}))) as {
          unread?: unknown;
        };
        const n = typeof data.unread === "number" ? data.unread : 0;
        if (!cancelled) setUnreadNotifications(Math.max(0, Math.floor(n)));
      } catch {
        if (!cancelled) setUnreadNotifications(0);
      }
    };

    void loadUnread();
    const onFocus = () => void loadUnread();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [session]);

  useEffect(() => {
    if (session) return;
    /* eslint-disable react-hooks/set-state-in-effect -- reset seller CTA when logged out */
    setStoresLoaded(false);
    setHasNoStoreInArea(false);
    setUnreadNotifications(0);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [session]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = menuRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <Bar>
      <Inner>
        <BrandCluster>
          <Brand
            href="/"
            aria-label={
              location?.name ? `PlaasMark (${location.name})` : "PlaasMark"
            }
          >
            <Image
              src="/logo.png"
              alt="PlaasMark"
              fill
              sizes="(max-width: 767px) 258px, 300px"
              priority
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </Brand>
        </BrandCluster>
        <Actions>
          {session ? (
            <BellLink
              href="/activity"
              aria-label={
                unreadNotifications > 0
                  ? `${t("activity")}, ${unreadNotifications}`
                  : t("activity")
              }
            >
              <BellIcon />
              {unreadNotifications > 0 ? (
                <NotifBadge>
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </NotifBadge>
              ) : null}
            </BellLink>
          ) : null}
          <LanguageToggle />
          <CartLink
            href={resolvedLocation ? `${locationPrefix}/cart` : "/"}
            aria-label={
              count ? `${t("cart")}, ${count} ${t("itemsWord")}` : t("cart")
            }
          >
            <BasketIcon />
            {count > 0 ? (
              <CartBadge>{count > 99 ? "99+" : count}</CartBadge>
            ) : null}
          </CartLink>
          <MenuWrap ref={menuRef}>
            <IconButton
              type="button"
              aria-label={t("menu")}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MenuIcon />
            </IconButton>
            {menuOpen ? (
              <Menu role="menu" aria-label={t("menu")}>
                {session ? (
                  <MenuMeta>
                    <MenuName>{session.name}</MenuName>
                    <MenuPhone>{sessionContactLabel(session)}</MenuPhone>
                  </MenuMeta>
                ) : null}

                <MenuGroupLabel>Browse</MenuGroupLabel>
                <MenuItem
                  role="menuitem"
                  href={resolvedLocation ? `${locationPrefix}/shop` : "/"}
                >
                  {t("shop")}
                </MenuItem>
                <MenuItem role="menuitem" href="/shops">
                  Shops
                </MenuItem>
                <MenuItem role="menuitem" href="/about">
                  {t("about")}
                </MenuItem>

                {session ? (
                  <>
                    <MenuDivider />
                    <MenuGroupLabel>Account</MenuGroupLabel>
                    <MenuItem role="menuitem" href="/account">
                      {t("account")}
                    </MenuItem>
                    <MenuItem role="menuitem" href="/activity">
                      {t("activity")}
                    </MenuItem>
                    <MenuItem role="menuitem" href="/my-orders">
                      {t("myOrders")}
                    </MenuItem>

                    {storesLoaded && hasNoStoreInArea ? (
                      <>
                        <MenuDivider />
                        <MenuGroupLabel>Selling</MenuGroupLabel>
                        <MenuItem role="menuitem" href="/begin-verkoop">
                          {t("beginSelling")}
                        </MenuItem>
                      </>
                    ) : null}

                    <MenuDivider />
                    <MenuGroupLabel>Session</MenuGroupLabel>
                    {adminRoutesEnabled ? (
                      <MenuItem role="menuitem" href="/admin">
                        Admin
                      </MenuItem>
                    ) : null}
                    <MenuButton
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        fetch("/api/logout", { method: "POST" }).catch(() => {
                          toast.error(t("errUnknown"));
                        });
                        clearStoredSession();
                        setSession(null);
                        setStoresLoaded(false);
                        setHasNoStoreInArea(false);
                        setUnreadNotifications(0);
                        setMenuOpen(false);
                        toast.success("Signed out.");
                        router.replace("/");
                      }}
                    >
                      {t("signOut")}
                    </MenuButton>
                  </>
                ) : (
                  <>
                    <MenuDivider />
                    <MenuGroupLabel>Sign in</MenuGroupLabel>
                    <MenuItem role="menuitem" href="/login">
                      {t("signIn")}
                    </MenuItem>
                    <MenuItem role="menuitem" href="/register">
                      {t("register")}
                    </MenuItem>
                  </>
                )}
              </Menu>
            ) : null}
          </MenuWrap>
        </Actions>
      </Inner>
    </Bar>
  );
}
