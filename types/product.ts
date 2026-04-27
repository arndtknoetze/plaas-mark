export type Product = {
  id: string;
  title: string;
  price: number;
  unit?: string;
  vendorId: string;
  vendorName: string;
  /** Store location; cart may only contain one location. */
  locationId: string;
  image?: string;
};
