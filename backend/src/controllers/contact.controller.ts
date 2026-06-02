import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import { contactSchema, contactQuerySchema } from "../schemas/contact.schema.js";
import { AppError } from "../middleware/errorHandler.js";

export async function sendContactMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const data = contactSchema.parse(req.body);

    await prisma.contactMessage.create({ data });

    res.status(201).json({ message: "Message envoyé avec succès" });
  } catch (err) {
    next(err);
  }
}

export async function getContactMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = contactQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count(),
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

    await prisma.contactMessage.delete({ where: { id: req.params.id } });

    res.json({ message: "Message supprimé" });
  } catch (err) {
    next(err);
  }
}
