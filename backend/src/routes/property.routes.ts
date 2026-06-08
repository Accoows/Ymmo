import { Router } from "express";
import {
  getProperties,
  getPropertyLocations,
  getFeaturedProperty,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/property.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", getProperties);
router.get("/locations", getPropertyLocations);
router.get("/featured", getFeaturedProperty);
router.get("/:id", getPropertyById);

router.post("/", authenticate, authorize("Superadmin", "AgencyHead"), createProperty);
router.put("/:id", authenticate, authorize("Superadmin", "AgencyHead"), updateProperty);
router.delete("/:id", authenticate, authorize("Superadmin", "AgencyHead"), deleteProperty);

export default router;
