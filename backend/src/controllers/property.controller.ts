import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import { createPropertySchema, updatePropertySchema, propertyQuerySchema } from "../schemas/property.schema.js";
import { AppError } from "../middleware/errorHandler.js";
import { canManageAgency } from "../middleware/auth.js";
import { geocode } from "../lib/geo.js";

interface PropertyDetails {
  features?: string[];
  year?: number;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

// Coordonnées choisies à la main (stockées dans details), sinon null.
function coordsFromDetails(details: PropertyDetails): { lat: number; lng: number } | null {
  if (typeof details.latitude === "number" && typeof details.longitude === "number") {
    return { lat: details.latitude, lng: details.longitude };
  }
  return null;
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
  agency: { id: string; name: string; city: string };
}) {
  const details = (p.details ?? {}) as PropertyDetails;
  const coords = coordsFromDetails(details) ?? geocode(p.localisation);
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
    agency: { id: p.agency.id, name: p.agency.name, city: p.agency.city },
    image: p.photos[0]?.path ?? "",
    gallery: p.photos.map((ph) => ph.path),
    description: p.description,
    features: details.features ?? [],
    year: details.year ?? null,
    latitude: coords?.lat ?? null,
    longitude: coords?.lng ?? null,
    postedAt: p.posted_at,
  };
}

// Construit un filtre numérique Prisma { gte?, lte? } à partir de bornes optionnelles.
function numericRange(min?: number, max?: number) {
  if (min === undefined && max === undefined) return undefined;
  const range: { gte?: number; lte?: number } = {};
  if (min !== undefined) range.gte = min;
  if (max !== undefined) range.lte = max;
  return range;
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
      agencyId,
      sort,
      page,
      limit,
    } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (agencyId) where.agencyId = agencyId;

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

    const priceRange = numericRange(minPrice, maxPrice);
    if (priceRange) where.price = priceRange;

    const surfaceRange = numericRange(minSurface, maxSurface);
    if (surfaceRange) where.surface = surfaceRange;

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
        include: { photos: true, type: true, agency: true },
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

// Données minimales géolocalisées de tous les biens (pour la carte admin).
export async function getPropertyLocations(_req: Request, res: Response, next: NextFunction) {
  try {
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        localisation: true,
        price: true,
        details: true,
        type: { select: { name: true } },
        agency: { select: { name: true } },
      },
      orderBy: { posted_at: "desc" },
    });

    const locations = properties
      .map((p) => {
        const details = (p.details ?? {}) as PropertyDetails;
        const coords = coordsFromDetails(details) ?? geocode(p.localisation);
        if (!coords) return null;
        return {
          id: p.id,
          title: p.name,
          location: p.localisation,
          type: p.type.name,
          agency: p.agency.name,
          priceRaw: Number(p.price),
          latitude: coords.lat,
          longitude: coords.lng,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    res.json({ locations });
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedProperty(_req: Request, res: Response, next: NextFunction) {
  try {
    const property = await prisma.property.findFirst({
      include: { photos: true, type: true, agency: true },
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
      include: { photos: true, type: true, agency: true },
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
    const { photos, agencyId: bodyAgencyId, ...propertyData } = data;

    // Le Superadmin choisit l'agence ; un AgencyHead crée pour la sienne.
    let agencyId: string;
    if (req.user?.role === "Superadmin") {
      if (!bodyAgencyId) throw new AppError(400, "L'agence est requise");
      agencyId = bodyAgencyId;
    } else {
      if (!req.user?.agencyId) throw new AppError(403, "Aucune agence rattachée à ce compte");
      agencyId = req.user.agencyId;
    }

    const [typeExists, agencyExists] = await Promise.all([
      prisma.propertyType.findUnique({ where: { id: data.typeId } }),
      prisma.agency.findUnique({ where: { id: agencyId } }),
    ]);
    if (!typeExists) throw new AppError(400, "Type de propriété invalide");
    if (!agencyExists) throw new AppError(400, "Agence invalide");

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        agencyId,
        price: propertyData.price,
        photos: photos?.length
          ? { create: photos.map((path) => ({ path })) }
          : undefined,
      },
      include: { photos: true, type: true, agency: true },
    });

    res.status(201).json({ property: formatProperty(property) });
  } catch (err) {
    next(err);
  }
}

export async function updateProperty(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updatePropertySchema.parse(req.body);
    const { photos, agencyId: bodyAgencyId, ...propertyData } = data;

    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      throw new AppError(404, "Propriété non trouvée");
    }
    if (!canManageAgency(req.user, existing.agencyId)) {
      throw new AppError(403, "Ce bien n'appartient pas à votre agence");
    }

    // Seul le Superadmin peut réattribuer un bien à une autre agence.
    let reassign: { agencyId: string } | Record<string, never> = {};
    if (req.user?.role === "Superadmin" && bodyAgencyId && bodyAgencyId !== existing.agencyId) {
      const agencyExists = await prisma.agency.findUnique({ where: { id: bodyAgencyId } });
      if (!agencyExists) throw new AppError(400, "Agence invalide");
      reassign = { agencyId: bodyAgencyId };
    }

    if (photos) {
      await prisma.media.deleteMany({ where: { propertyId: req.params.id } });
    }

    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: {
        ...propertyData,
        ...reassign,
        ...(photos
          ? { photos: { create: photos.map((path) => ({ path })) } }
          : {}),
      },
      include: { photos: true, type: true, agency: true },
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
    if (!canManageAgency(req.user, existing.agencyId)) {
      throw new AppError(403, "Ce bien n'appartient pas à votre agence");
    }

    await prisma.property.delete({ where: { id: req.params.id } });

    res.json({ message: "Propriété supprimée" });
  } catch (err) {
    next(err);
  }
}
