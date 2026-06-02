import { Router } from "express";
import { getPropertyTypes } from "../controllers/propertyType.controller.js";

const router = Router();

router.get("/", getPropertyTypes);

export default router;
