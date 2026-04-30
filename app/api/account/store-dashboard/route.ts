import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLocationFromUrlOrHeaders } from "@/lib/location";
import { resolveAccountMember } from "@/lib/resolve-account-member";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const storeId = (url.searchParams.get("storeId") ?? "").trim();
    if (!storeId) {
      return NextResponse.json(
        { error: 'Query parameter "storeId" is required.' },
        { status: 400 },
      );
    }

    const account = await resolveAccountMember(request);
    if (!account) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const location = await getLocationFromUrlOrHeaders(request);

    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({ where: { id: account.id } });
      if (!member) {
        return {
          status: 403 as const,
          payload: { error: "Member not found." },
        };
      }

      const store = await tx.store.findUnique({
        where: { id: storeId },
        select: {
          id: true,
          memberId: true,
          locationId: true,
          name: true,
          slug: true,
          isActive: true,
          brandColor: true,
          logoUrl: true,
          addressText: true,
          hoursText: true,
          whatsapp: true,
        },
      });

      if (!store || store.memberId !== member.id) {
        return { status: 403 as const, payload: { error: "Forbidden." } };
      }

      if (store.locationId !== location.id) {
        return {
          status: 403 as const,
          payload: { error: "This shop is not in your current area." },
        };
      }

      const [productsCount, ordersCount, productsPreview, ordersPreview] =
        await Promise.all([
          tx.product.count({ where: { vendorId: store.id } }),
          tx.order.count({
            where: {
              locationId: location.id,
              items: { some: { vendorId: store.id } },
            },
          }),
          tx.product.findMany({
            where: { vendorId: store.id },
            orderBy: { updatedAt: "desc" },
            take: 4,
            select: {
              id: true,
              title: true,
              price: true,
              unit: true,
              image: true,
            },
          }),
          tx.order.findMany({
            where: {
              locationId: location.id,
              items: { some: { vendorId: store.id } },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
              member: { select: { name: true, phone: true } },
              items: {
                where: { vendorId: store.id },
                select: { price: true, quantity: true, name: true },
              },
            },
          }),
        ]);

      const since = new Date();
      since.setDate(since.getDate() - 30);
      const recentForSales = await tx.order.findMany({
        where: {
          locationId: location.id,
          createdAt: { gte: since },
          items: { some: { vendorId: store.id } },
        },
        include: {
          items: {
            where: { vendorId: store.id },
            select: { price: true, quantity: true },
          },
        },
      });

      const recentSales = recentForSales.reduce((sum, o) => {
        return (
          sum +
          o.items.reduce(
            (s2, line) => s2 + Number(line.price) * line.quantity,
            0,
          )
        );
      }, 0);

      return {
        status: 200 as const,
        payload: {
          store: {
            id: store.id,
            name: store.name,
            slug: store.slug,
            isActive: store.isActive,
            brandColor: store.brandColor,
            logoUrl: store.logoUrl,
            description: store.addressText || store.hoursText || null,
            phoneNumber: store.whatsapp || null,
          },
          stats: {
            productsCount,
            ordersCount,
            recentSales,
            recentSalesDays: 30,
          },
          productsPreview: productsPreview.map((p) => ({
            id: p.id,
            title: p.title,
            price: Number(p.price),
            unit: p.unit ?? undefined,
            image: p.image ?? undefined,
          })),
          ordersPreview: ordersPreview.map((o) => {
            const total = o.items.reduce(
              (sum, line) => sum + Number(line.price) * line.quantity,
              0,
            );
            return {
              id: o.id,
              createdAt: o.createdAt.toISOString(),
              status: o.status,
              customerName: o.member.name,
              customerPhone: o.member.phone,
              total,
              items: o.items.map((line) => ({
                name: line.name,
                quantity: line.quantity,
              })),
            };
          }),
        },
      };
    });

    return NextResponse.json(result.payload, { status: result.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to load store dashboard." },
      { status: 500 },
    );
  }
}
