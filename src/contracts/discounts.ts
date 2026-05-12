import { ProductContract } from "./product";

export interface DiscountContract {
  id: string;
  description: string | null;
  percentage: number;
  productId: string;
  imageUrl: string | null;

  product: ProductContract;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
