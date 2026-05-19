import z from "zod";

export const createOrderSchema = z.object({
  streetAddress: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string().optional(),
  country: z.string(),
  contactName: z.string(),
  contactPhone: z.string(),
  contactEmail: z.string(),
  note: z.string().max(500).optional(),
})