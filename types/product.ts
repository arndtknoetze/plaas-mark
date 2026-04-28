export type Product = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  images?: string[];
  price: number;
  unit?: string;
  vendorId: string;
  vendorName: string;
  /** Store location; cart may only contain one location. */
  locationId: string;
  /** Backward-compatible single image (usually images[0]). */
  image?: string;
  isFeatured?: boolean;
  isActive?: boolean;
};
