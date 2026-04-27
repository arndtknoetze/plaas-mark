"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/types/cart";

export const CART_LOCATION_MISMATCH_AF =
  "Jy kan net produkte van een dorp op 'n slag bestel";

type AddPayload = {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  vendorId?: string;
  vendorName?: string;
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
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((payload: AddPayload): AddToCartResult => {
    const qty = payload.quantity ?? 1;
    const vendorId = payload.vendorId ?? "";
    const vendorName = payload.vendorName ?? "";
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
            vendorId,
            vendorName,
            locationId,
          },
        ];
      }

      const next = [...prev];
      const line = next[index];
      next[index] = {
        ...line,
        quantity: line.quantity + qty,
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
      clearCart,
    }),
    [items, cartLocationId, addToCart, removeFromCart, clearCart],
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
