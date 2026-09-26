import { Router } from "express";
import { protect, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { upload } from "../middlewares/upload.js";
import { taskRules, reportRules } from "../validators/index.js";
import {
  listTasks,
  createTask,
  updateTask,
  updateAssignment,
  addDeliverable,
  submitReport,
  listReports,
  myReportStatus,
  searchAll,
} from "../controllers/workController.js";

const router = Router();
router.use(protect);

router.get("/search", searchAll);
router.get("/tasks", listTasks);
router.post("/tasks", authorize("admin", "team_leader"), taskRules, validate, createTask);
router.patch("/tasks/:id", authorize("admin", "team_leader"), updateTask);
router.patch("/assignments/:id", updateAssignment);
router.post("/assignments/:id/deliverables", upload.single("file"), addDeliverable);
router.get("/reports", listReports);
router.get("/reports/today", myReportStatus);
router.post("/reports", reportRules, validate, submitReport);

export default router;
