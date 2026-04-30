const STORAGE_KEY = "plaasmark-session";

export type StoredSession = {
  name: string;
  email?: string;
  phone?: string;
};

export function loadStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (typeof o.name !== "string") {
      return null;
    }
    const name = o.name.trim();
    if (!name) return null;
    const email =
      typeof o.email === "string" ? o.email.trim().toLowerCase() : "";
    const phone = typeof o.phone === "string" ? o.phone.trim() : undefined;
    if (email) {
      return { name, email, ...(phone ? { phone } : {}) };
    }
    if (phone) {
      return { name, phone };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: StoredSession): void {
  if (typeof window === "undefined") return;
  try {
    const email = session.email?.trim().toLowerCase() ?? "";
    const phone = session.phone?.trim();
    if (!email && !phone) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name: session.name.trim(),
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
      }),
    );
    window.dispatchEvent(new Event("plaasmark-session"));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("plaasmark-session"));
  } catch {
    /* ignore */
  }
}

export function sessionContactLabel(s: StoredSession | null): string {
  if (!s) return "";
  const e = s.email?.trim();
  const p = s.phone?.trim();
  return (e || p || "").trim();
}
