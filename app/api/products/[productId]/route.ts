import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLocationFromUrlOrHeaders } from "@/lib/location";
import { resolveAccountMember } from "@/lib/resolve-account-member";

function normalizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
}

function normalizeOptionalString(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  if (typeof input !== "string") return null;
  const v = input.trim();
  return v ? v : "";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { productId } = await params;

  const account = await resolveAccountMember(request, {
    phone: normalizePhone(body.phone) || undefined,
    email: typeof body.email === "string" ? body.email : undefined,
  });
  if (!account) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : null;
  const unit = normalizeOptionalString(body.unit);
  const image = normalizeOptionalString(body.image);
  const price =
    typeof body.price === "number"
      ? body.price
      : typeof body.price === "string"
        ? Number(body.price)
        : NaN;

  if (title !== null && !title) {
    return NextResponse.json(
      { error: "title cannot be empty." },
      { status: 400 },
    );
  }
  if (!Number.isFinite(price) && body.price !== undefined) {
    return NextResponse.json(
      { error: "price must be a number." },
      { status: 400 },
    );
  }
  if (Number.isFinite(price) && price <= 0) {
    return NextResponse.json(
      { error: "price must be greater than 0." },
      { status: 400 },
    );
  }

  try {
    const location = await getLocationFromUrlOrHeaders(request);

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: {
          store: { select: { id: true, memberId: true, locationId: true } },
        },
      });
      if (!product) {
        return { status: 404 as const, payload: { error: "Not found." } };
      }
      if (product.store.memberId !== account.id) {
        return { status: 403 as const, payload: { error: "Forbidden." } };
      }
      if (product.store.locationId !== location.id) {
        return {
          status: 403 as const,
          payload: { error: "This shop is not in your current area." },
        };
      }

      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          ...(title !== null ? { title } : {}),
          ...(Number.isFinite(price) ? { price } : {}),
          ...(unit !== null ? { unit: unit || null } : {}),
          ...(image !== null ? { image: image || null } : {}),
        },
        select: { id: true },
      });

      return {
        status: 200 as const,
        payload: { ok: true, productId: updated.id },
      };
    });

    return NextResponse.json(result.payload, { status: result.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to update product." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { productId } = await params;

  const account = await resolveAccountMember(request, {
    phone: normalizePhone(body.phone) || undefined,
    email: typeof body.email === "string" ? body.email : undefined,
  });
  if (!account) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const location = await getLocationFromUrlOrHeaders(request);

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { store: { select: { memberId: true, locationId: true } } },
      });
      if (!product) {
        return { status: 404 as const, payload: { error: "Not found." } };
      }
      if (product.store.memberId !== account.id) {
        return { status: 403 as const, payload: { error: "Forbidden." } };
      }
      if (product.store.locationId !== location.id) {
        return {
          status: 403 as const,
          payload: { error: "This shop is not in your current area." },
        };
      }

      await tx.product.delete({ where: { id: productId } });
      return { status: 200 as const, payload: { ok: true } };
    });

    return NextResponse.json(result.payload, { status: result.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete product." },
      { status: 500 },
    );
  }
}
