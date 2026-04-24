"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/types/cart";

type AddPayload = {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  vendorId?: string;
  vendorName?: string;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (payload: AddPayload) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((payload: AddPayload) => {
    const qty = payload.quantity ?? 1;
    const vendorId = payload.vendorId ?? "";
    const vendorName = payload.vendorName ?? "";

    setItems((prev) => {
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
          },
        ];
      }
      const next = [...prev];
      const line = next[index];
      next[index] = { ...line, quantity: line.quantity + qty };
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, clearCart }),
    [items, addToCart, removeFromCart, clearCart],
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
