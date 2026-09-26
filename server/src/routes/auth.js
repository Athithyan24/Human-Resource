import { Router } from "express";
import { login, me } from "../controllers/authController.js";
import { loginRules } from "../validators/index.js";
import { validate } from "../middlewares/validate.js";
import { protect } from "../middlewares/auth.js";

const router = Router();
router.post("/login", loginRules, validate, login);
router.get("/me", protect, me);
export default router;
