"use client";

import styled from "styled-components";
import { useLanguage, type TranslationKey } from "@/lib/useLanguage";
import { TownBanner } from "@/components/TownBanner";
import { storeLocationSlug } from "@/lib/location-storage";

export type LocationChoice = {
  slug?: string;
  label: string;
  href: string;
  province?: string | null;
};

const Wrap = styled.section`
  padding: 56px 0 72px;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 16px;
`;

const Hero = styled.div`
  text-align: center;
  margin: 0 auto 24px;
  max-width: 720px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.9rem;
  font-weight: 950;
  letter-spacing: -0.04em;
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1.1;

  @media (min-width: 768px) {
    font-size: 2.35rem;
  }
`;

const Lead = styled.p`
  margin: 12px 0 0;
  font-size: 1.02rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Grid = styled.ul`
  list-style: none;
  padding: 0;
  margin: 26px 0 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
`;

const CardLink = styled.a`
  display: block;
  border-radius: 18px;
  overflow: hidden;
  text-decoration: none;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.04),
    0 12px 26px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.14s ease,
    box-shadow 0.14s ease,
    border-color 0.14s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(46, 94, 62, 0.35);
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.04),
      0 16px 36px rgba(0, 0, 0, 0.12);
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
  }
`;

const Pager = styled.nav`
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const PagerLink = styled.a<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 900;
  border: 1px solid rgba(0, 0, 0, 0.12);
  color: ${({ theme }) => theme.colors.textDark};
  background: #fff;
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};
`;

const PagerMeta = styled.span`
  font-size: 0.92rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 700;
`;

export function LocationSelector({
  heading,
  headingKey,
  leadKey,
  locations,
  pagination,
}: {
  heading?: string;
  headingKey?: TranslationKey;
  leadKey?: TranslationKey;
  locations: LocationChoice[];
  pagination?: {
    page: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
    basePath: string;
  };
}) {
  const { t } = useLanguage();
  const resolvedHeading = headingKey ? t(headingKey) : (heading ?? "");
  const resolvedLead = leadKey ? t(leadKey) : t("selectLocationLead");
  const page = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const basePath = pagination?.basePath ?? "/";
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const prevHref = `${basePath}?page=${Math.max(1, page - 1)}`;
  const nextHref = `${basePath}?page=${Math.min(totalPages, page + 1)}`;

  return (
    <Wrap aria-labelledby="location-selector-heading">
      <Inner>
        <Hero>
          <Title id="location-selector-heading">{resolvedHeading}</Title>
          <Lead>{resolvedLead}</Lead>
        </Hero>

        <Grid>
          {locations.map(({ label, href, slug, province }) => (
            <li key={href}>
              <CardLink
                href={href}
                aria-label={`${label} — ${t("startShopping")}`}
                onClick={() => {
                  if (slug) storeLocationSlug(slug);
                }}
              >
                <TownBanner
                  town={label}
                  province={province}
                  slug={slug ?? label}
                />
              </CardLink>
            </li>
          ))}
        </Grid>
        {pagination ? (
          <Pager aria-label="Location pages">
            <PagerLink href={prevHref} $disabled={!hasPrev}>
              Previous
            </PagerLink>
            <PagerMeta>
              Page {page} of {totalPages} ({pagination.totalItems} locations)
            </PagerMeta>
            <PagerLink href={nextHref} $disabled={!hasNext}>
              Next
            </PagerLink>
          </Pager>
        ) : null}
      </Inner>
    </Wrap>
  );
}
