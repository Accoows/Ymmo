import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import { createPropertySchema, updatePropertySchema, propertyQuerySchema } from "../schemas/property.schema.js";
import { AppError } from "../middleware/errorHandler.js";

interface PropertyDetails {
  features?: string[];
  year?: number;
  [key: string]: unknown;
}

function formatProperty(p: {
  id: string;
  name: string;
  description: string;
  localisation: string;
  price: unknown;
  surface: number;
  bedroom: number;
  bathroom: number;
  garage: number;
  details: unknown;
  posted_at: Date;
  photos: { id: string; path: string }[];
  type: { id: number; name: string };
}) {
  const details = (p.details ?? {}) as PropertyDetails;
  return {
    id: p.id,
    title: p.name,
    location: p.localisation,
    price: Number(p.price).toLocaleString("fr-FR").replace(/\u202F/g, " ") + " €",
    priceRaw: Number(p.price),
    bedrooms: p.bedroom,
    bathrooms: p.bathroom,
    surface: p.surface,
    parking: p.garage,
    type: p.type.name,
    typeId: p.type.id,
    image: p.photos[0]?.path ?? "",
    gallery: p.photos.map((ph) => ph.path),
    description: p.description,
    features: details.features ?? [],
    year: details.year ?? null,
    postedAt: p.posted_at,
  };
}

export async function getProperties(req: Request, res: Response, next: NextFunction) {
  try {
    const query = propertyQuerySchema.parse(req.query);
    const {
      search,
      type,
      minPrice,
      maxPrice,
      minSurface,
      maxSurface,
      minBedrooms,
      minBathrooms,
      minGarage,
      sort,
      page,
      limit,
    } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { localisation: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = { name: { equals: type, mode: "insensitive" } };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) (where.price as Record<string, unknown>).gte = minPrice;
      if (maxPrice !== undefined) (where.price as Record<string, unknown>).lte = maxPrice;
    }

    if (minSurface !== undefined || maxSurface !== undefined) {
      where.surface = {};
      if (minSurface !== undefined) (where.surface as Record<string, unknown>).gte = minSurface;
      if (maxSurface !== undefined) (where.surface as Record<string, unknown>).lte = maxSurface;
    }

    if (minBedrooms !== undefined) where.bedroom = { gte: minBedrooms };
    if (minBathrooms !== undefined) where.bathroom = { gte: minBathrooms };
    if (minGarage !== undefined) where.garage = { gte: minGarage };

    const orderBy =
      sort === "price_asc"
        ? { price: "asc" as const }
        : sort === "price_desc"
        ? { price: "desc" as const }
        : sort === "surface_desc"
        ? { surface: "desc" as const }
        : { posted_at: "desc" as const };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: { photos: true, type: true },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      properties: properties.map(formatProperty),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedProperty(_req: Request, res: Response, next: NextFunction) {
  try {
    const property = await prisma.property.findFirst({
      include: { photos: true, type: true },
      orderBy: { price: "desc" },
    });

    if (!property) {
      res.json({ property: null });
      return;
    }

    res.json({ property: formatProperty(property) });
  } catch (err) {
    next(err);
  }
}

export async function getPropertyById(req: Request, res: Response, next: NextFunction) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: { photos: true, type: true },
    });

    if (!property) {
      throw new AppError(404, "Propriété non trouvée");
    }

    res.json({ property: formatProperty(property) });
  } catch (err) {
    next(err);
  }
}

export async function createProperty(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createPropertySchema.parse(req.body);
    const { photos, ...propertyData } = data;

    const typeExists = await prisma.propertyType.findUnique({ where: { id: data.typeId } });
    if (!typeExists) {
      throw new AppError(400, "Type de propriété invalide");
    }

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        price: propertyData.price,
        photos: photos?.length
          ? { create: photos.map((path) => ({ path })) }
          : undefined,
      },
      include: { photos: true, type: true },
    });

    res.status(201).json({ property: formatProperty(property) });
  } catch (err) {
    next(err);
  }
}

export async function updateProperty(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updatePropertySchema.parse(req.body);
    const { photos, ...propertyData } = data;

    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      throw new AppError(404, "Propriété non trouvée");
    }

    if (photos) {
      await prisma.media.deleteMany({ where: { propertyId: req.params.id } });
    }

    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: {
        ...propertyData,
        ...(photos
          ? { photos: { create: photos.map((path) => ({ path })) } }
          : {}),
      },
      include: { photos: true, type: true },
    });

    res.json({ property: formatProperty(property) });
  } catch (err) {
    next(err);
  }
}

export async function deleteProperty(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      throw new AppError(404, "Propriété non trouvée");
    }

    await prisma.property.delete({ where: { id: req.params.id } });

    res.json({ message: "Propriété supprimée" });
  } catch (err) {
    next(err);
  }
}
