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
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (payload: AddPayload) => void;
  removeFromCart: (productId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((payload: AddPayload) => {
    const qty = payload.quantity ?? 1;
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

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart }),
    [items, addToCart, removeFromCart],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
