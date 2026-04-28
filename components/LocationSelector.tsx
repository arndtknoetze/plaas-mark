"use client";

import styled from "styled-components";
import { useLanguage, type TranslationKey } from "@/lib/useLanguage";

export type LocationChoice = {
  label: string;
  href: string;
  imageUrl: string;
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
  display: flex;
  flex-direction: column;
  min-height: 320px;
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

const CardImage = styled.div<{ $src: string }>`
  position: relative;
  height: 168px;
  background-image: url(${({ $src }) => JSON.stringify($src)});
  background-size: cover;
  background-position: center;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.18) 70%,
      rgba(0, 0, 0, 0.32) 100%
    );
  }
`;

const CardBody = styled.div`
  padding: 14px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`;

const CardTitle = styled.div`
  font-size: 1.15rem;
  font-weight: 950;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textDark};
`;

const CardMeta = styled.div`
  font-size: 0.92rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textLight};
`;

const CardCta = styled.div`
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  border-radius: 12px;
  font-weight: 900;
  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  transition: background 0.14s ease;

  ${CardLink}:hover & {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

export function LocationSelector({
  heading,
  headingKey,
  leadKey,
  locations,
}: {
  heading?: string;
  headingKey?: TranslationKey;
  leadKey?: TranslationKey;
  locations: LocationChoice[];
}) {
  const { t } = useLanguage();
  const resolvedHeading = headingKey ? t(headingKey) : (heading ?? "");
  const resolvedLead = leadKey ? t(leadKey) : t("selectLocationLead");

  return (
    <Wrap aria-labelledby="location-selector-heading">
      <Inner>
        <Hero>
          <Title id="location-selector-heading">{resolvedHeading}</Title>
          <Lead>{resolvedLead}</Lead>
        </Hero>

        <Grid>
          {locations.map(({ label, href, imageUrl }) => (
            <li key={href}>
              <CardLink
                href={href}
                aria-label={`${label} — ${t("startShopping")}`}
              >
                <CardImage $src={imageUrl} />
                <CardBody>
                  <CardTitle>{label}</CardTitle>
                  <CardMeta>{t("welcomeDescription")}</CardMeta>
                  <CardCta>{t("startShopping")}</CardCta>
                </CardBody>
              </CardLink>
            </li>
          ))}
        </Grid>
      </Inner>
    </Wrap>
  );
}
