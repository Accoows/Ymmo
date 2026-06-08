import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import { createAgencySchema } from "../schemas/agency.schema.js";
import { AppError } from "../middleware/errorHandler.js";

export async function getAgencies(_req: Request, res: Response, next: NextFunction) {
  try {
    const agencies = await prisma.agency.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        city: true,
        email: true,
        phone: true,
        _count: { select: { properties: true } },
      },
    });
    res.json({ agencies });
  } catch (err) {
    next(err);
  }
}

export async function createAgency(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createAgencySchema.parse(req.body);

    const exists = await prisma.agency.findUnique({ where: { name: data.name } });
    if (exists) {
      throw new AppError(409, "Une agence porte déjà ce nom");
    }

    const agency = await prisma.agency.create({ data });
    res.status(201).json({ agency });
  } catch (err) {
    next(err);
  }
}
