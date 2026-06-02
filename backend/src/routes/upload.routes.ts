import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { photoUpload } from "../middleware/upload.js";
import { createUploads } from "../controllers/upload.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

// Exécute Multer et traduit ses erreurs (taille, nombre…) en AppError 400.
function handleUpload(req: Request, res: Response, next: NextFunction) {
  photoUpload.array("photos", 12)(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Fichier trop volumineux (max 5 Mo)"
          : err.code === "LIMIT_FILE_COUNT"
            ? "Trop de fichiers (max 12)"
            : "Erreur lors du téléversement";
      return next(new AppError(400, message));
    }
    if (err) return next(err);
    next();
  });
}

router.post(
  "/",
  authenticate,
  authorize("Admin", "Superadmin", "AgencyHead"),
  handleUpload,
  createUploads
);

export default router;
