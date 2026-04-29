"use client";

import Link from "next/link";
import styled from "styled-components";
import {
  HorizontalScrollList,
  HorizontalScrollItem,
} from "./HorizontalScrollList";

type Store = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
};

const Wrap = styled.section`
  margin: 0;
`;

const Eyebrow = styled.p`
  margin: 0 0 10px;
  font-size: 0.85rem;
  line-height: 1.45;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textLight};
`;

const StoreLink = styled(Link)`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  width: 88px;
  transform: translateY(0);
  transition: transform 0.12s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
    border-radius: 14px;
  }
`;

const Avatar = styled.div<{ $seed: string }>`
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: ${({ $seed }) => {
    // deterministic, warm-ish gradients without heavy logic
    const n = [...$seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const h = n % 360;
    return `linear-gradient(145deg, hsl(${h} 55% 90%) 0%, hsl(${(h + 26) % 360} 55% 80%) 100%)`;
  }};
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 8px 18px rgba(0, 0, 0, 0.06);
`;

const LogoImg = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  border-radius: inherit;
`;

const Initials = styled.span`
  font-size: 1.05rem;
  font-weight: 950;
  letter-spacing: -0.03em;
  color: rgba(20, 27, 24, 0.85);
`;

const Name = styled.span`
  width: 100%;
  text-align: center;
  font-size: 0.8125rem;
  line-height: 1.2;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.textDark};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

function getInitials(name: string) {
  const words = name.trim().split(/\s+/g).filter(Boolean);
  if (words.length === 0) return "PM";
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  const s = `${first}${last}`.toUpperCase();
  return s || name.trim().slice(0, 2).toUpperCase() || "PM";
}

export function StoreCarousel({
  stores,
  title,
  locationSlug,
}: {
  stores: Store[];
  title: string;
  locationSlug?: string;
}) {
  if (stores.length === 0) return null;

  const prefix = locationSlug ? `/${locationSlug}` : "";

  return (
    <Wrap aria-label={title}>
      <Eyebrow>{title}</Eyebrow>
      <HorizontalScrollList>
        {stores.map((s) => (
          <HorizontalScrollItem key={s.id}>
            <StoreLink
              href={`${prefix}/${prefix ? "store" : "shop"}/${s.slug}--${encodeURIComponent(s.id)}`}
              aria-label={s.name}
              title={s.name}
            >
              <Avatar $seed={s.id}>
                {s.logoUrl ? (
                  <LogoImg
                    src={s.logoUrl}
                    alt={`${s.name} logo`}
                    loading="lazy"
                  />
                ) : (
                  <Initials aria-hidden>{getInitials(s.name)}</Initials>
                )}
              </Avatar>
              <Name>{s.name}</Name>
            </StoreLink>
          </HorizontalScrollItem>
        ))}
      </HorizontalScrollList>
    </Wrap>
  );
}
