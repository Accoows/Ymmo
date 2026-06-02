import { Router } from "express";
import {
  sendContactMessage,
  getContactMessages,
  deleteContactMessage,
} from "../controllers/contact.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/", sendContactMessage);
router.get(
  "/",
  authenticate,
  authorize("Admin", "Superadmin", "AgencyHead"),
  getContactMessages
);
router.delete(
  "/:id",
  authenticate,
  authorize("Admin", "Superadmin"),
  deleteContactMessage
);

export default router;
