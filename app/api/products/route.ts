import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const rows = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    const products = rows.map((p) => ({
      id: p.id,
      title: p.title,
      price: Number(p.price),
      unit: p.unit ?? undefined,
      vendorId: p.vendorId,
      vendorName: p.vendorName,
      image: p.image ?? undefined,
    }));

    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 },
    );
  }
}
