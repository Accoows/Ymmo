import jwt from "jsonwebtoken";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} doit être défini dans les variables d'environnement`);
  }
  return value;
}

const JWT_SECRET = requireEnv("JWT_SECRET");
const JWT_EXPIRES_IN = "7d";

export interface JwtPayload {
  userId: string;
  role: string;
  agencyId: string | null;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
