import { Router } from "express";
import { protect, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { departmentRules, teamRules, userAccountRules } from "../validators/index.js";
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  listTeams,
  createTeam,
  updateTeam,
  createLeader,
  createEmployee,
  listEmployees,
  getEmployee,
  updateEmployee,
} from "../controllers/orgController.js";

const router = Router();
router.use(protect);

router.get("/departments", listDepartments);
router.post("/departments", authorize("admin"), departmentRules, validate, createDepartment);
router.patch("/departments/:id", authorize("admin"), updateDepartment);

router.get("/teams", listTeams);
router.post("/teams", authorize("admin"), teamRules, validate, createTeam);
router.patch("/teams/:id", authorize("admin"), updateTeam);

router.get("/employees", listEmployees);
router.get("/employees/:id", getEmployee);
router.patch("/employees/:id", authorize("admin"), updateEmployee);
router.post("/leaders", authorize("admin"), userAccountRules, validate, createLeader);
router.post("/employees", authorize("admin"), userAccountRules, validate, createEmployee);

export default router;
