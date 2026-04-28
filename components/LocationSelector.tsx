"use client";

import { useLanguage, type TranslationKey } from "@/lib/useLanguage";

export type LocationChoice = { label: string; href: string };

export function LocationSelector({
  heading,
  headingKey,
  locations,
}: {
  heading?: string;
  headingKey?: TranslationKey;
  locations: LocationChoice[];
}) {
  const { t } = useLanguage();
  const resolvedHeading = headingKey ? t(headingKey) : (heading ?? "");

  return (
    <section
      className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16 text-center"
      aria-labelledby="location-selector-heading"
    >
      <h1
        id="location-selector-heading"
        className="text-2xl font-semibold tracking-tight text-[var(--foreground)]"
      >
        {resolvedHeading}
      </h1>
      <ul className="flex flex-col gap-3">
        {locations.map(({ label, href }) => (
          <li key={href}>
            <a
              href={href}
              className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-4 text-lg font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--accent)] hover:bg-[var(--muted)]"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
