import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  Card,
  EmptyState,
  SectionHeader,
  SecondaryButton,
  Table,
  TableCard,
  TableScroll,
  Td,
  Th,
} from "@/components/admin/AdminUI";
import {
  AdminToastForm,
  type AdminActionResult,
} from "@/components/admin/AdminToastForm";

export const dynamic = "force-dynamic";

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

    if (!id || !name || !slug) {
      return {
        ok: false,
        error: "Missing required fields.",
        nonce: crypto.randomUUID(),
      };
    }

    await prisma.location.update({
      where: { id },
      data: { name, slug, bannerImageUrl },
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

    if (!name || !slug) {
      return {
        ok: false,
        error: "Name and slug are required.",
        nonce: crypto.randomUUID(),
      };
    }

    await prisma.location.create({
      data: { name, slug, bannerImageUrl },
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

export default async function AdminLocationsPage() {
  if (process.env.ADMIN_ROUTES_ENABLED !== "true") {
    notFound();
  }

  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      bannerImageUrl: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <SectionHeader
        title="Locations"
        subtitle="Towns used as subdomains. Manage name, slug, and banner image."
      />

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
                          <SecondaryButton type="submit">Save</SecondaryButton>
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
    </div>
  );
}
