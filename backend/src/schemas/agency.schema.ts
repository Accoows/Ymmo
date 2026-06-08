import { z } from "zod";

export const createAgencySchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(120),
  city: z.string().min(1, "La ville est requise").max(120),
  email: z.string().email("Email invalide"),
  phone: z.string().max(30).optional(),
});
