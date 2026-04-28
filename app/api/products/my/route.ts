import { NextResponse } from "next/server";
import { getLocationFromHeaders } from "@/lib/location";
import { prisma } from "@/lib/db";

function normalizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const phone = normalizePhone(url.searchParams.get("phone"));
  const storeId = (url.searchParams.get("storeId") ?? "").trim();

  if (!phone || !storeId) {
    return NextResponse.json(
      { error: "phone and storeId are required." },
      { status: 400 },
    );
  }

  try {
    const location = await getLocationFromHeaders();

    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({ where: { phone } });
      if (!member) {
        return {
          status: 403 as const,
          payload: { error: "Member not found." },
        };
      }

      const store = await tx.store.findUnique({ where: { id: storeId } });
      if (!store || store.memberId !== member.id) {
        return { status: 403 as const, payload: { error: "Forbidden." } };
      }

      if (store.locationId !== location.id) {
        return {
          status: 403 as const,
          payload: {
            error:
              "This shop is not in your current area. Open the correct area subdomain and try again.",
          },
        };
      }

      const rows = await tx.product.findMany({
        where: { vendorId: store.id },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          price: true,
          unit: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const products = rows.map((p) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        unit: p.unit ?? undefined,
        image: p.image ?? undefined,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));

      return { status: 200 as const, payload: { products } };
    });

    return NextResponse.json(result.payload, { status: result.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to load products." },
      { status: 500 },
    );
  }
}
