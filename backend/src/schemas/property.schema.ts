import { z } from "zod";

export const createPropertySchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200),
  description: z.string().min(1, "La description est requise"),
  typeId: z.number().int().positive(),
  localisation: z.string().min(1, "La localisation est requise").max(200),
  price: z.number().positive("Le prix doit être positif"),
  surface: z.number().int().positive("La surface doit être positive"),
  bedroom: z.number().int().min(0),
  bathroom: z.number().int().min(0),
  garage: z.number().int().min(0),
  details: z.record(z.unknown()).optional(),
  photos: z.array(z.string().url()).optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertyQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minSurface: z.coerce.number().int().min(0).optional(),
  maxSurface: z.coerce.number().int().min(0).optional(),
  minBedrooms: z.coerce.number().int().min(0).optional(),
  minBathrooms: z.coerce.number().int().min(0).optional(),
  minGarage: z.coerce.number().int().min(0).optional(),
  sort: z
    .enum(["recent", "price_asc", "price_desc", "surface_desc"])
    .default("recent"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
