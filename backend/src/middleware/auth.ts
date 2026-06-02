import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt.js";
import { AppError } from "./errorHandler.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError(401, "Authentification requise"));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError(401, "Token invalide ou expiré"));
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Authentification requise"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "Accès interdit"));
    }
    next();
  };
}
