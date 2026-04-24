"use client";

import styled from "styled-components";
import { ProductCard } from "@/components/ProductCard";
import { mockProducts } from "@/lib/mock-products";

const PageTitle = styled.h1`
  margin: 0 0 20px;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textDark};

  @media (min-width: 768px) {
    margin-bottom: 28px;
    font-size: 1.75rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

export default function Home() {
  return (
    <>
      <PageTitle>Vars produkte</PageTitle>
      <Grid>
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Grid>
    </>
  );
}
