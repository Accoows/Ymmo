import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";

export async function getPropertyTypes(_req: Request, res: Response, next: NextFunction) {
  try {
    const types = await prisma.propertyType.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { properties: true } } },
    });

    res.json({ propertyTypes: types });
  } catch (err) {
    next(err);
  }
}
