import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import { contactSchema, contactQuerySchema } from "../schemas/contact.schema.js";
import { AppError } from "../middleware/errorHandler.js";
import { canManageAgency } from "../middleware/auth.js";

export async function sendContactMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const data = contactSchema.parse(req.body);

    // L'agence destinataire vient du bien concerné, ou du choix du visiteur.
    let agencyId: string;
    if (data.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: data.propertyId },
        select: { agencyId: true },
      });
      if (!property) throw new AppError(400, "Bien introuvable");
      agencyId = property.agencyId;
    } else {
      if (!data.agencyId) throw new AppError(400, "Veuillez sélectionner une agence");
      const agency = await prisma.agency.findUnique({ where: { id: data.agencyId } });
      if (!agency) throw new AppError(400, "Agence invalide");
      agencyId = data.agencyId;
    }

    await prisma.contactMessage.create({ data: { ...data, agencyId } });

    res.status(201).json({ message: "Message envoyé avec succès" });
  } catch (err) {
    next(err);
  }
}

export async function getContactMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = contactQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    // Un AgencyHead ne voit que les messages de son agence ; le Superadmin, tous.
    const where =
      req.user?.role === "Superadmin"
        ? {}
        : { agencyId: req.user?.agencyId ?? "__none__" };

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        include: { agency: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    // Resolve the name of the property each message refers to (no FK relation in schema)
    const propertyIds = [
      ...new Set(
        messages
          .map((m) => m.propertyId)
          .filter((id): id is string => Boolean(id))
      ),
    ];
    const properties = propertyIds.length
      ? await prisma.property.findMany({
          where: { id: { in: propertyIds } },
          select: { id: true, name: true },
        })
      : [];
    const propertyNames = new Map(properties.map((p) => [p.id, p.name]));

    res.json({
      messages: messages.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        subject: m.subject,
        message: m.message,
        propertyId: m.propertyId,
        propertyName: m.propertyId ? propertyNames.get(m.propertyId) ?? null : null,
        agency: m.agency.name,
        createdAt: m.createdAt,
      })),
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

export async function deleteContactMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.contactMessage.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      throw new AppError(404, "Message non trouvé");
    }
    if (!canManageAgency(req.user, existing.agencyId)) {
      throw new AppError(403, "Ce message ne relève pas de votre agence");
    }

    await prisma.contactMessage.delete({ where: { id: req.params.id } });

    res.json({ message: "Message supprimé" });
  } catch (err) {
    next(err);
  }
}
