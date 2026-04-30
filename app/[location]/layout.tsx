import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { sitePath, indexableRobots } from "@/lib/seo";

function titleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location: slug } = await params;

  let row: { name: string } | null = null;
  try {
    row = await prisma.location.findUnique({
      where: { slug },
      select: { name: true },
    });
  } catch {
    row = null;
  }

  const name = row?.name ?? titleCaseFromSlug(slug);
  const title = `Koop plaas vars produkte in ${name} | PlaasMark`;
  const description = `Ontdek vars produkte in ${name}. Koop direk van plaaslike verkopers.`;
  const path = `/${slug}`;

  return {
    title,
    description,
    robots: indexableRobots,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: sitePath(path),
      siteName: "PlaasMark",
      type: "website",
    },
  };
}

export default function LocationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
