import z from "zod";

export const schema = z.object({
  name: z.string().min(1, "Please enter a valid name"),
  email: z.email("Please enter a valid email"),
  organization: z.string().optional(),
  service: z.string().optional(),
  message: z
    .string()
    .min(3, "Please enter a text between 3 and 3000 characters")
    .max(3000, "Please enter a text between 3 and 3000 characters"),
});
