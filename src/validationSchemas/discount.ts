import z from "zod";

export const createDiscountSchema = z.object({
  description: z.string().max(255).optional(),
  percentage: z.number().min(0).max(100),
  productId: z.string(),
  expiresAt: z.date(),
  imageKey: z.string().optional(),
});