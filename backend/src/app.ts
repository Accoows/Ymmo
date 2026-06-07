import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import propertyTypeRoutes from "./routes/propertyType.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import { uploadsDir } from "./middleware/upload.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Fichiers téléversés, servis en statique (hors limiteur de requêtes API).
app.use(
  "/uploads",
  express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);



app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/property-types", propertyTypeRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/uploads", uploadRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
