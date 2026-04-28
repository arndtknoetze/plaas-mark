"use client";

import styled from "styled-components";

type StoreOption = { id: string; name: string; slug: string };

const Bar = styled.section`
  position: sticky;
  top: 70px;
  z-index: 10;
  margin: 0;
  padding: 10px;
  border-radius: 16px;
  background: rgba(245, 245, 240, 0.92);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.06);

  @media (min-width: 768px) {
    top: 78px;
    padding: 12px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 768px) {
    grid-template-columns: 1.2fr 1fr;
    gap: 12px;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textLight};
`;

const Input = styled.input`
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(46, 94, 62, 0.15);
  }
`;

const Select = styled.select`
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid #d8d8d4;
  border-radius: 12px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textDark};
  background: #ffffff;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(46, 94, 62, 0.15);
  }
`;

export function FilterBar({
  searchLabel,
  searchPlaceholder,
  storeLabel,
  allStoresLabel,
  query,
  onQueryChange,
  store,
  onStoreChange,
  stores,
}: {
  searchLabel: string;
  searchPlaceholder: string;
  storeLabel: string;
  allStoresLabel: string;
  query: string;
  onQueryChange: (v: string) => void;
  store: string;
  onStoreChange: (v: string) => void;
  stores: StoreOption[];
}) {
  return (
    <Bar aria-label="Filters">
      <Grid>
        <Field>
          <Label htmlFor="shop-search">{searchLabel}</Label>
          <Input
            id="shop-search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            inputMode="search"
          />
        </Field>
        <Field>
          <Label htmlFor="shop-store">{storeLabel}</Label>
          <Select
            id="shop-store"
            value={store}
            onChange={(e) => onStoreChange(e.target.value)}
          >
            <option value="all">{allStoresLabel}</option>
            {stores.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
      </Grid>
    </Bar>
  );
}
