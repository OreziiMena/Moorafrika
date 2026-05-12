import z from "zod";

export const checkoutSchema = z.object({
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  contactEmail: z.email("Invalid email address").min(1, "Contact email is required"),
  note: z.string().nullable(),
});