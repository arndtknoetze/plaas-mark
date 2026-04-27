const STORAGE_KEY = "plaasmark-session";

export type SessionRole = "customer" | "seller";

export type StoredSession = {
  role: SessionRole;
  name: string;
  phone: string;
};

export function loadStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (
      (o.role !== "customer" && o.role !== "seller") ||
      typeof o.name !== "string" ||
      typeof o.phone !== "string"
    ) {
      return null;
    }
    const name = o.name.trim();
    const phone = o.phone.trim();
    if (!name || !phone) return null;
    return { role: o.role, name, phone };
  } catch {
    return null;
  }
}

export function saveStoredSession(session: StoredSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        role: session.role,
        name: session.name.trim(),
        phone: session.phone.trim(),
      }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
