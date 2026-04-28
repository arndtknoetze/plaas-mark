"use client";

import styled from "styled-components";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/product";

const Wrap = styled.div`
  width: 240px;

  @media (min-width: 420px) {
    width: 260px;
  }

  @media (min-width: 768px) {
    width: 280px;
  }
`;

export function FeaturedProductCard({ product }: { product: Product }) {
  return (
    <Wrap>
      <ProductCard product={product} />
    </Wrap>
  );
}
