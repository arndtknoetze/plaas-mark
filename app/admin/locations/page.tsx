import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  Card,
  EmptyState,
  PrimaryButton,
  SectionHeader,
  SecondaryButton,
  Table,
  TableCard,
  TableScroll,
  Td,
  Th,
} from "@/components/admin/AdminUI";
import { ImportLocationsButton } from "@/components/admin/ImportLocationsButton";
import {
  AdminToastForm,
  type AdminActionResult,
} from "@/components/admin/AdminToastForm";

export const dynamic = "force-dynamic";
const LOCATIONS_PER_PAGE = 100;

async function updateLocation(
  _prev: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  "use server";
  try {
    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const bannerImageUrlRaw = String(
      formData.get("bannerImageUrl") ?? "",
    ).trim();
    const bannerImageUrl = bannerImageUrlRaw ? bannerImageUrlRaw : null;
    const provinceRaw = String(formData.get("province") ?? "").trim();
    const province = provinceRaw || null;
    const latRaw = String(formData.get("lat") ?? "").trim();
    const lngRaw = String(formData.get("lng") ?? "").trim();
    const lat = latRaw ? Number(latRaw) : null;
    const lng = lngRaw ? Number(lngRaw) : null;

    if (!id || !name || !slug) {
      return {
        ok: false,
        error: "Missing required fields.",
        nonce: crypto.randomUUID(),
      };
    }
    if (
      (latRaw && !Number.isFinite(lat)) ||
      (lngRaw && !Number.isFinite(lng))
    ) {
      return {
        ok: false,
        error: "Latitude/longitude must be valid numbers.",
        nonce: crypto.randomUUID(),
      };
    }

    await prisma.location.update({
      where: { id },
      data: { name, slug, bannerImageUrl, province, lat, lng },
    });
    revalidatePath("/admin/locations");
    return { ok: true, toast: "Location saved.", nonce: crypto.randomUUID() };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save location.",
      nonce: crypto.randomUUID(),
    };
  }
}

async function createLocation(
  _prev: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  "use server";
  try {
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const bannerImageUrlRaw = String(
      formData.get("bannerImageUrl") ?? "",
    ).trim();
    const bannerImageUrl = bannerImageUrlRaw ? bannerImageUrlRaw : null;
    const provinceRaw = String(formData.get("province") ?? "").trim();
    const province = provinceRaw || null;
    const latRaw = String(formData.get("lat") ?? "").trim();
    const lngRaw = String(formData.get("lng") ?? "").trim();
    const lat = latRaw ? Number(latRaw) : null;
    const lng = lngRaw ? Number(lngRaw) : null;

    if (!name || !slug) {
      return {
        ok: false,
        error: "Name and slug are required.",
        nonce: crypto.randomUUID(),
      };
    }
    if (
      (latRaw && !Number.isFinite(lat)) ||
      (lngRaw && !Number.isFinite(lng))
    ) {
      return {
        ok: false,
        error: "Latitude/longitude must be valid numbers.",
        nonce: crypto.randomUUID(),
      };
    }

    await prisma.location.create({
      data: { name, slug, bannerImageUrl, province, lat, lng },
    });
    revalidatePath("/admin/locations");
    return { ok: true, toast: "Location created.", nonce: crypto.randomUUID() };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not create location.",
      nonce: crypto.randomUUID(),
    };
  }
}

function buildAdminLocationsHref(page: number, q: string): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (q) params.set("q", q);
  return `/admin/locations?${params.toString()}`;
}

export default async function AdminLocationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (process.env.ADMIN_ROUTES_ENABLED !== "true") {
    notFound();
  }

  const sp = (await searchParams) ?? {};
  const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (qRaw ?? "").trim();
  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const pageNum = Number(pageRaw);
  const page =
    Number.isFinite(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1;

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { province: { contains: q } },
        ],
      }
    : undefined;

  const total = await prisma.location.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / LOCATIONS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * LOCATIONS_PER_PAGE;

  const locations = await prisma.location.findMany({
    where,
    orderBy: { name: "asc" },
    skip,
    take: LOCATIONS_PER_PAGE,
    select: {
      id: true,
      name: true,
      slug: true,
      province: true,
      lat: true,
      lng: true,
      bannerImageUrl: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <SectionHeader
        title="Locations"
        subtitle={`Towns used as subdomains. Showing ${locations.length} of ${total}.`}
        actions={<ImportLocationsButton />}
      />

      <Card $pad="sm" style={{ marginBottom: 12 }}>
        <form
          method="get"
          style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, slug, province..."
            style={{
              minHeight: 40,
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.12)",
              padding: "0 12px",
            }}
          />
          <PrimaryButton type="submit">Search</PrimaryButton>
        </form>
      </Card>

      <Card>
        <AdminToastForm
          action={createLocation}
          successMessage="Location created."
        >
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 900, fontSize: "0.9rem" }}>
                  Name
                </span>
                <input
                  name="name"
                  placeholder="Malmesbury"
                  style={{
                    minHeight: 44,
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.12)",
                    padding: "0 12px",
                  }}
                  required
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 900, fontSize: "0.9rem" }}>
                  Slug
                </span>
                <input
                  name="slug"
                  placeholder="malmesbury"
                  style={{
                    minHeight: 44,
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.12)",
                    padding: "0 12px",
                  }}
                  required
                />
              </label>
            </div>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900, fontSize: "0.9rem" }}>
                Banner image URL
              </span>
              <input
                name="bannerImageUrl"
                placeholder="https://..."
                style={{
                  minHeight: 44,
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.12)",
                  padding: "0 12px",
                }}
              />
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 900, fontSize: "0.9rem" }}>
                  Province
                </span>
                <input
                  name="province"
                  placeholder="Western Cape"
                  style={{
                    minHeight: 44,
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.12)",
                    padding: "0 12px",
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 900, fontSize: "0.9rem" }}>
                  Latitude
                </span>
                <input
                  name="lat"
                  type="number"
                  step="any"
                  placeholder="-33.4608"
                  style={{
                    minHeight: 44,
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.12)",
                    padding: "0 12px",
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 900, fontSize: "0.9rem" }}>
                  Longitude
                </span>
                <input
                  name="lng"
                  type="number"
                  step="any"
                  placeholder="18.7271"
                  style={{
                    minHeight: 44,
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.12)",
                    padding: "0 12px",
                  }}
                />
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <SecondaryButton type="submit">Create location</SecondaryButton>
            </div>
          </div>
        </AdminToastForm>
      </Card>

      <div style={{ marginTop: 12 }}>
        {locations.length === 0 ? (
          <EmptyState
            title="No locations"
            body="Create your first town/location above."
          />
        ) : (
          <TableCard>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <Th>Location</Th>
                    <Th>Subdomain slug</Th>
                    <Th>Province</Th>
                    <Th>Lat</Th>
                    <Th>Lng</Th>
                    <Th>Banner</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((l) => (
                    <tr key={l.id}>
                      <Td $strong>
                        <input
                          name="name"
                          form={`loc-${l.id}`}
                          defaultValue={l.name}
                          style={{
                            width: "100%",
                            minHeight: 38,
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,0.10)",
                            padding: "0 10px",
                          }}
                        />
                      </Td>
                      <Td>
                        <input
                          name="slug"
                          form={`loc-${l.id}`}
                          defaultValue={l.slug}
                          style={{
                            width: "100%",
                            minHeight: 38,
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,0.10)",
                            padding: "0 10px",
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                            fontSize: "0.85rem",
                          }}
                        />
                      </Td>
                      <Td>
                        <input
                          name="province"
                          form={`loc-${l.id}`}
                          defaultValue={l.province ?? ""}
                          style={{
                            width: "100%",
                            minHeight: 38,
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,0.10)",
                            padding: "0 10px",
                          }}
                        />
                      </Td>
                      <Td>
                        <input
                          name="lat"
                          form={`loc-${l.id}`}
                          type="number"
                          step="any"
                          defaultValue={l.lat ?? ""}
                          style={{
                            width: "100%",
                            minHeight: 38,
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,0.10)",
                            padding: "0 10px",
                          }}
                        />
                      </Td>
                      <Td>
                        <input
                          name="lng"
                          form={`loc-${l.id}`}
                          type="number"
                          step="any"
                          defaultValue={l.lng ?? ""}
                          style={{
                            width: "100%",
                            minHeight: 38,
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,0.10)",
                            padding: "0 10px",
                          }}
                        />
                      </Td>
                      <Td>
                        <div style={{ display: "grid", gap: 8 }}>
                          <input
                            name="bannerImageUrl"
                            form={`loc-${l.id}`}
                            defaultValue={l.bannerImageUrl ?? ""}
                            placeholder="https://..."
                            style={{
                              width: "100%",
                              minHeight: 38,
                              borderRadius: 10,
                              border: "1px solid rgba(0,0,0,0.10)",
                              padding: "0 10px",
                            }}
                          />
                          {l.bannerImageUrl ? (
                            /* eslint-disable @next/next/no-img-element -- banner URLs are admin-managed and may be remote */
                            <img
                              src={l.bannerImageUrl}
                              alt=""
                              style={{
                                width: "100%",
                                maxWidth: 320,
                                height: 64,
                                objectFit: "cover",
                                borderRadius: 10,
                                border: "1px solid rgba(0,0,0,0.08)",
                              }}
                            />
                          ) : /* eslint-enable @next/next/no-img-element */
                          null}
                        </div>
                      </Td>
                      <Td style={{ whiteSpace: "nowrap" }}>
                        {l.createdAt.toLocaleDateString("en-ZA", {
                          dateStyle: "medium",
                        })}
                      </Td>
                      <Td>
                        <AdminToastForm
                          id={`loc-${l.id}`}
                          action={updateLocation}
                          successMessage="Location saved."
                        >
                          <input type="hidden" name="id" value={l.id} />
                          <PrimaryButton type="submit">Save</PrimaryButton>
                        </AdminToastForm>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
          </TableCard>
        )}
      </div>
      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <a
          href={buildAdminLocationsHref(Math.max(1, safePage - 1), q)}
          style={{
            pointerEvents: safePage > 1 ? "auto" : "none",
            opacity: safePage > 1 ? 1 : 0.45,
            minHeight: 40,
            padding: "0 12px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.12)",
            textDecoration: "none",
            fontWeight: 900,
            color: "inherit",
            background: "#fff",
          }}
        >
          Previous
        </a>
        <div style={{ fontWeight: 800, color: "rgba(0,0,0,0.7)" }}>
          Page {safePage} of {totalPages}
        </div>
        <a
          href={buildAdminLocationsHref(Math.min(totalPages, safePage + 1), q)}
          style={{
            pointerEvents: safePage < totalPages ? "auto" : "none",
            opacity: safePage < totalPages ? 1 : 0.45,
            minHeight: 40,
            padding: "0 12px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.12)",
            textDecoration: "none",
            fontWeight: 900,
            color: "inherit",
            background: "#fff",
          }}
        >
          Next
        </a>
      </div>
    </div>
  );
}
