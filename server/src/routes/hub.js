import { Router } from "express";
import { protect, authorize } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import {
  listAnnouncements,
  createAnnouncement,
  listDocuments,
  createDocument,
  listTraining,
  createTraining,
  completeTraining,
  listMessages,
  postMessage,
  listNotifications,
  markRead,
} from "../controllers/commsController.js";
import { dashboard, weeklyAnalytics } from "../controllers/dashboardController.js";

const router = Router();
router.use(protect);

router.get("/dashboard", dashboard);
router.get("/analytics/weekly", weeklyAnalytics);

router.get("/announcements", listAnnouncements);
router.post("/announcements", authorize("admin"), createAnnouncement);

router.get("/documents", listDocuments);
router.post("/documents", authorize("admin"), upload.single("file"), createDocument);

router.get("/training", listTraining);
router.post("/training", authorize("admin"), createTraining);
router.post("/training/:id/complete", completeTraining);

router.get("/messages", listMessages);
router.post("/messages", postMessage);

router.get("/notifications", listNotifications);
router.post("/notifications/read", markRead);

export default router;
