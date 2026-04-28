import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json({ locations });
  } catch {
    return NextResponse.json(
      { error: "Failed to load locations." },
      { status: 500 },
    );
  }
}
