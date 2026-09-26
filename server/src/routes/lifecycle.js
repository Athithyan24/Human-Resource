import { Router } from "express";
import { protect, authorize } from "../middlewares/auth.js";
import {
  listLifecycle,
  promoteOrTransfer,
  startResignation,
  updateResignation,
  generateReviews,
  listReviews,
} from "../controllers/lifecycleController.js";

const router = Router();
router.use(protect);

router.get("/lifecycle", authorize("admin"), listLifecycle);
router.post("/employees/:id/growth", authorize("admin"), promoteOrTransfer);
router.post("/resignations", authorize("admin"), startResignation);
router.patch("/resignations/:id", authorize("admin"), updateResignation);
router.get("/performance", listReviews);
router.post("/performance/generate", authorize("admin"), generateReviews);

export default router;
