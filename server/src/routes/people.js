import { Router } from "express";
import { protect, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { leaveRules } from "../validators/index.js";
import {
  checkIn,
  checkOut,
  listAttendance,
  heatmap,
  applyLeave,
  listLeaves,
  reviewLeave,
} from "../controllers/peopleOpsController.js";

const router = Router();
router.use(protect);

router.post("/attendance/check-in", checkIn);
router.post("/attendance/check-out", checkOut);
router.get("/attendance", listAttendance);
router.get("/attendance/heatmap", heatmap);

router.get("/leaves", listLeaves);
router.post("/leaves", leaveRules, validate, applyLeave);
router.patch("/leaves/:id", authorize("admin", "team_leader"), reviewLeave);

export default router;
