/** Default composer text when messaging a buyer about their order. */
export const DEFAULT_WHATSAPP_ORDER_MESSAGE =
  "Hi, your PlaasMark order is ready for collection.";

/**
 * Produce digits-only international number for `wa.me/&lt;digits&gt;`.
 * Handles common South African formats (0-prefix, +27, 27…).
 */
export function phoneToWhatsAppDigits(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length < 9) return null;

  if (d.length === 10 && d.startsWith("0")) {
    return `27${d.slice(1)}`;
  }

  if (d.startsWith("27") && d.length >= 11) {
    return d;
  }

  if (d.length === 9) {
    return `27${d}`;
  }

  if (d.length >= 10) {
    return d;
  }

  return null;
}

/** `https://wa.me/&lt;phone&gt;?text=&lt;encoded&gt;` or `null` if phone unusable. */
export function buildWhatsAppUrl(phone: string, text: string): string | null {
  const n = phoneToWhatsAppDigits(phone);
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}
