import z from "zod";

export const createOrderSchema = z.object({
  deliveryAddress: z.string().min(5).max(255),
  contactName: z.string(),
  contactPhone: z.string(),
  contactEmail: z.string(),
  note: z.string().max(500).optional(),
})