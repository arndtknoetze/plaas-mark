const STORAGE_KEY = "plaasmark-customer";

export type StoredCustomer = {
  name: string;
  phone: string;
};

export function loadStoredCustomer(): StoredCustomer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof (parsed as Record<string, unknown>).name !== "string" ||
      typeof (parsed as Record<string, unknown>).phone !== "string"
    ) {
      return null;
    }
    const name = (parsed as StoredCustomer).name.trim();
    const phone = (parsed as StoredCustomer).phone.trim();
    if (!name || !phone) return null;
    return { name, phone };
  } catch {
    return null;
  }
}

export function saveStoredCustomer(name: string, phone: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ name: name.trim(), phone: phone.trim() }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}
