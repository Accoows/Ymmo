import { Router } from "express";
import { getAgencies, createAgency } from "../controllers/agency.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", getAgencies);
router.post("/", authenticate, authorize("Superadmin"), createAgency);

export default router;
