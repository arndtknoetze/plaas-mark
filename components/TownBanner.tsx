"use client";

import styled from "styled-components";

const Wrap = styled.div<{ $bg: string }>`
  position: relative;
  height: clamp(120px, 18vw, 180px);
  border-radius: 12px;
  overflow: hidden;
  background: ${({ $bg }) => $bg};
`;

const Pattern = styled.div<{ $pattern: string }>`
  position: absolute;
  inset: 0;
  background-image: ${({ $pattern }) => $pattern};
  background-size: 160px 160px;
  opacity: 0.2;
`;

const Content = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 4px;
  padding: 14px;
  color: rgba(15, 23, 42, 0.92);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
`;

const TownName = styled.div`
  font-size: clamp(1.05rem, 2.2vw, 1.4rem);
  line-height: 1.1;
  font-weight: 950;
  letter-spacing: -0.02em;
`;

const Province = styled.div`
  font-size: 0.84rem;
  color: rgba(15, 23, 42, 0.62);
  font-weight: 700;
`;

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function hueFromTown(slug: string): number {
  return hash(slug) % 360;
}

function gradientFromTown(slug: string): string {
  const h = hueFromTown(slug);
  const h2 = (h + 35) % 360;
  const h3 = (h + 75) % 360;
  return `linear-gradient(135deg, hsl(${h} 42% 86%) 0%, hsl(${h2} 38% 80%) 55%, hsl(${h3} 34% 74%) 100%)`;
}

function patternFromTown(slug: string): string {
  const hue = (hueFromTown(slug) + 15) % 360;
  return `radial-gradient(circle at 20% 20%, hsla(${hue} 35% 40% / 0.45) 0 2px, transparent 2.5px), radial-gradient(circle at 75% 70%, hsla(${hue} 35% 40% / 0.35) 0 1.6px, transparent 2px)`;
}

export function TownBanner({
  town,
  province,
  slug,
}: {
  town: string;
  province?: string | null;
  slug: string;
}) {
  return (
    <Wrap $bg={gradientFromTown(slug)}>
      <Pattern $pattern={patternFromTown(slug)} />
      <Content>
        <TownName>{town}</TownName>
        <Province>{province?.trim() || "South Africa"}</Province>
      </Content>
    </Wrap>
  );
}
