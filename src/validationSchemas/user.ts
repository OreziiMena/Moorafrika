import z from "zod";

export const updateUserSchema = z.object({
  email: z.email("Invalid email format"),
  name: z.string().min(3, "Name must be at least 3 characters long"),
  address: z.string().nullable(),
  phone: z.string().nullable(),
});

export const updatePasswordSchema = z.object({
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
  oldPassword: z.string().min(6, 'Old password must be at least 6 characters long'),
})