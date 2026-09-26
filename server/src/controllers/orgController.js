import bcrypt from "bcryptjs";
import { Department } from "../models/Department.js";
import { Team } from "../models/Team.js";
import { Employee } from "../models/Employee.js";
import { User } from "../models/User.js";
import { EmployeeActivityLog } from "../models/EmployeeActivityLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { nextEmployeeId } from "../utils/employeeId.js";
import { notify } from "../utils/notify.js";
import { departmentRepo, teamRepo, employeeRepo } from "../repositories/index.js";

export const listDepartments = asyncHandler(async (_req, res) => {
  const items = await departmentRepo.findAll();
  res.json({ success: true, items });
});

export const createDepartment = asyncHandler(async (req, res) => {
  const item = await Department.create(req.body);
  res.status(201).json({ success: true, item });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const item = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) throw new ApiError(404, "Department not found");
  res.json({ success: true, item });
});

export const listTeams = asyncHandler(async (_req, res) => {
  const items = await teamRepo.findAll();
  res.json({ success: true, items });
});

export const createTeam = asyncHandler(async (req, res) => {
  const item = await Team.create(req.body);
  if (item.leader) {
    await Employee.findByIdAndUpdate(item.leader, { team: item._id });
  }
  const populated = await Team.findById(item._id).populate("department leader members");
  res.status(201).json({ success: true, item: populated });
});

export const updateTeam = asyncHandler(async (req, res) => {
  const item = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
    "department leader members"
  );
  if (!item) throw new ApiError(404, "Team not found");
  if (req.body.members) {
    await Employee.updateMany({ team: item._id }, { $unset: { team: 1 } });
    await Employee.updateMany({ _id: { $in: req.body.members } }, { team: item._id });
    if (item.leader) await Employee.findByIdAndUpdate(item.leader, { team: item._id });
  }
  res.json({ success: true, item });
});

async function createAccount({
  username,
  password,
  role,
  firstName,
  lastName,
  email,
  phone,
  department,
  team,
  designation,
  manager,
  actor,
}) {
  const exists = await User.findOne({ username });
  if (exists) throw new ApiError(400, "Username already taken");
  const emailTaken = await Employee.findOne({ email });
  if (emailTaken) throw new ApiError(400, "Email already registered");
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash, role });
  const employeeId = await nextEmployeeId();
  const employee = await Employee.create({
    employeeId,
    user: user._id,
    firstName,
    lastName,
    email,
    phone,
    department,
    team,
    designation,
    manager,
    status: "onboarding",
    lifecycleStage: "onboarding",
  });
  user.employee = employee._id;
  await user.save();
  if (team) {
    await Team.findByIdAndUpdate(team, { $addToSet: { members: employee._id } });
    if (role === "team_leader") await Team.findByIdAndUpdate(team, { leader: employee._id });
  }
  await EmployeeActivityLog.create({
    employee: employee._id,
    actor,
    action: "account_created",
    meta: { role, employeeId },
  });
  await notify(user._id, {
    type: "onboarding",
    title: "Welcome to Arclight HR",
    body: "Your workspace account is ready. Complete onboarding and meet your team.",
    link: "/onboarding",
  });
  return employeeRepo.findById(employee._id);
}

export const createLeader = asyncHandler(async (req, res) => {
  const item = await createAccount({ ...req.body, role: "team_leader", actor: req.user._id });
  res.status(201).json({ success: true, item });
});

export const createEmployee = asyncHandler(async (req, res) => {
  const item = await createAccount({
    ...req.body,
    role: req.body.role || "employee",
    actor: req.user._id,
  });
  res.status(201).json({ success: true, item });
});

export const listEmployees = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.team) filter.team = req.query.team;
  if (req.query.status) filter.status = req.query.status;
  if (req.user.role === "team_leader" && req.user.employee?.team) {
    filter.team = req.user.employee.team._id || req.user.employee.team;
  }
  const items = await employeeRepo.findAll(filter);
  res.json({ success: true, items });
});

export const getEmployee = asyncHandler(async (req, res) => {
  const item = await employeeRepo.findById(req.params.id);
  if (!item) throw new ApiError(404, "Employee not found");
  res.json({ success: true, item });
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const item = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
    "department team manager user"
  );
  if (!item) throw new ApiError(404, "Employee not found");
  res.json({ success: true, item });
});
