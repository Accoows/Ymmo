import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  email: z.string().email("Email invalide"),
  phone: z.string().max(20).optional(),
  subject: z.string().min(1, "Le sujet est requis").max(200),
  message: z.string().min(1, "Le message est requis").max(5000),
  propertyId: z.string().uuid().optional(),
});

export const contactQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
