import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler.js";

export function createUploads(req: Request, res: Response, next: NextFunction) {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) {
      throw new AppError(400, "Aucun fichier reçu");
    }

    const paths = files.map((file) => `/uploads/${file.filename}`);
    res.status(201).json({ paths });
  } catch (err) {
    next(err);
  }
}
