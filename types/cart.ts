export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  vendorId: string;
  vendorName: string;
  /** Same for every line in the mandjie (single-location cart). */
  locationId: string;
};
