"use client";

import {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CartItem } from "@/types/cart";

export const CART_LOCATION_MISMATCH_AF =
  "Jy kan net produkte van een dorp op 'n slag bestel";

const CART_STORAGE_KEY = "plaasmark_cart_v1";

type AddPayload = {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  storeId?: string;
  storeName?: string;
  /** Must match `product.store.locationId`. */
  locationId: string;
};

export type AddToCartResult = { ok: true } | { ok: false; error: string };

type CartContextValue = {
  items: CartItem[];
  /** Location shared by all lines; `null` when the mandjie is empty. */
  cartLocationId: string | null;
  addToCart: (payload: AddPayload) => AddToCartResult;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function safeParseCartItems(value: unknown): CartItem[] {
  const rawItems =
    value && typeof value === "object" && "items" in value
      ? (value as { items?: unknown }).items
      : value;

  if (!Array.isArray(rawItems)) return [];

  const out: CartItem[] = [];
  for (const row of rawItems) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;

    // Backwards compat: previously stored as vendorId/vendorName.
    const storeId =
      typeof o.storeId === "string"
        ? o.storeId
        : typeof o.vendorId === "string"
          ? o.vendorId
          : "";
    const storeName =
      typeof o.storeName === "string"
        ? o.storeName
        : typeof o.vendorName === "string"
          ? o.vendorName
          : "";

    if (
      typeof o.productId !== "string" ||
      typeof o.name !== "string" ||
      typeof o.price !== "number" ||
      !Number.isFinite(o.price) ||
      typeof o.quantity !== "number" ||
      !Number.isInteger(o.quantity) ||
      o.quantity < 1 ||
      typeof o.locationId !== "string" ||
      o.locationId.trim().length === 0
    ) {
      continue;
    }

    out.push({
      productId: o.productId,
      name: o.name,
      price: o.price,
      quantity: o.quantity,
      storeId,
      storeName,
      locationId: o.locationId,
    });
  }

  // Enforce single-location cart if storage got corrupted.
  const loc = out[0]?.locationId ?? null;
  return loc ? out.filter((x) => x.locationId === loc) : [];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const hydratedRef = useRef(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate localStorage-backed cart after mount */
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) {
        hydratedRef.current = true;
        return;
      }
      const parsed: unknown = JSON.parse(raw);
      setItems(safeParseCartItems(parsed));
    } catch {
      // Ignore malformed storage.
    } finally {
      hydratedRef.current = true;
    }
    /* eslint-enable react-hooks/set-state-in-effect -- hydrate localStorage-backed cart after mount */
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydratedRef.current) return;
    try {
      const payload = { items };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota / private mode errors.
    }
  }, [items]);

  const addToCart = useCallback((payload: AddPayload): AddToCartResult => {
    const qty = payload.quantity ?? 1;
    const storeId = payload.storeId ?? "";
    const storeName = payload.storeName ?? "";
    const locationId = payload.locationId?.trim() ?? "";

    if (!locationId) {
      return { ok: false, error: "Produk het geen geldige gebied nie." };
    }

    let mismatch = false;

    setItems((prev) => {
      if (prev.length > 0 && prev[0].locationId !== locationId) {
        mismatch = true;
        return prev;
      }

      const index = prev.findIndex((x) => x.productId === payload.productId);
      if (index === -1) {
        return [
          ...prev,
          {
            productId: payload.productId,
            name: payload.name,
            price: payload.price,
            quantity: qty,
            storeId,
            storeName,
            locationId,
          },
        ];
      }

      const next = [...prev];
      const line = next[index];
      next[index] = {
        ...line,
        quantity: line.quantity + qty,
        storeId,
        storeName,
        locationId,
      };
      return next;
    });

    if (mismatch) {
      return { ok: false, error: CART_LOCATION_MISMATCH_AF };
    }

    return { ok: true };
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const q = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
    if (q <= 0) {
      setItems((prev) => prev.filter((x) => x.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((x) => (x.productId === productId ? { ...x, quantity: q } : x)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartLocationId = items.length === 0 ? null : items[0].locationId;

  const value = useMemo(
    () => ({
      items,
      cartLocationId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      cartLocationId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
