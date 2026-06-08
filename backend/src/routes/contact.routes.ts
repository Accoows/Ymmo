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
  authorize("Superadmin", "AgencyHead"),
  getContactMessages
);
router.delete(
  "/:id",
  authenticate,
  authorize("Superadmin", "AgencyHead"),
  deleteContactMessage
);

export default router;
