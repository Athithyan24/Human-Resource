import { Promotion } from "../models/Promotion.js";
import { Resignation } from "../models/Resignation.js";
import { Employee } from "../models/Employee.js";
import { EmployeeActivityLog } from "../models/EmployeeActivityLog.js";
import { PerformanceReview } from "../models/PerformanceReview.js";
import { Attendance } from "../models/Attendance.js";
import { TaskAssignment } from "../models/TaskAssignment.js";
import { TaskReport } from "../models/TaskReport.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { computePerformance } from "../utils/performance.js";
import { notify } from "../utils/notify.js";

export const listLifecycle = asyncHandler(async (_req, res) => {
  const promotions = await Promotion.find().populate("employee toTeam toDepartment").sort({ createdAt: -1 });
  const resignations = await Resignation.find().populate("employee").sort({ createdAt: -1 });
  const logs = await EmployeeActivityLog.find().populate("employee actor").sort({ createdAt: -1 }).limit(40);
  res.json({ success: true, promotions, resignations, logs });
});

export const promoteOrTransfer = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) throw new ApiError(404, "Employee not found");
  const record = await Promotion.create({
    employee: employee._id,
    fromDesignation: employee.designation,
    toDesignation: req.body.toDesignation || employee.designation,
    fromTeam: employee.team,
    toTeam: req.body.toTeam || employee.team,
    fromDepartment: employee.department,
    toDepartment: req.body.toDepartment || employee.department,
    kind: req.body.kind || "promotion",
    note: req.body.note,
    effectiveDate: req.body.effectiveDate,
  });
  employee.designation = req.body.toDesignation || employee.designation;
  if (req.body.toTeam) employee.team = req.body.toTeam;
  if (req.body.toDepartment) employee.department = req.body.toDepartment;
  employee.lifecycleStage = req.body.kind === "transfer" ? "transfer" : "promotion";
  if (req.body.status) employee.status = req.body.status;
  await employee.save();
  await EmployeeActivityLog.create({
    employee: employee._id,
    actor: req.user._id,
    action: req.body.kind || "promotion",
    meta: req.body,
  });
  await notify(employee.user, {
    type: "growth",
    title: req.body.kind === "reward" ? "You received a reward" : "Role update",
    body: req.body.note || `${req.body.kind} recorded`,
    link: `/directory/${employee._id}`,
  });
  res.status(201).json({ success: true, item: record });
});

export const startResignation = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.body.employee);
  if (!employee) throw new ApiError(404, "Employee not found");
  const item = await Resignation.create({
    employee: employee._id,
    reason: req.body.reason,
    noticeStart: req.body.noticeStart || new Date(),
    noticeEnd: req.body.noticeEnd,
    status: "notice",
  });
  employee.status = "on_notice";
  employee.lifecycleStage = "resignation";
  await employee.save();
  await EmployeeActivityLog.create({
    employee: employee._id,
    actor: req.user._id,
    action: "resignation",
    meta: { reason: req.body.reason },
  });
  res.status(201).json({ success: true, item });
});

export const updateResignation = asyncHandler(async (req, res) => {
  const item = await Resignation.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("employee");
  if (!item) throw new ApiError(404, "Resignation not found");
  if (item.status === "completed") {
    await Employee.findByIdAndUpdate(item.employee._id, { status: "exited", lifecycleStage: "exit" });
  }
  res.json({ success: true, item });
});

export const generateReviews = asyncHandler(async (req, res) => {
  const period = req.body.period || new Date().toISOString().slice(0, 7);
  const employees = await Employee.find({ status: { $in: ["active", "onboarding", "on_notice"] } });
  const created = [];
  for (const emp of employees) {
    const att = await Attendance.find({ employee: emp._id });
    const present = att.filter((a) => a.status !== "absent").length;
    const attendanceRate = att.length ? (present / att.length) * 100 : 70;
    const assignments = await TaskAssignment.find({ employee: emp._id });
    const done = assignments.filter((a) => a.status === "completed").length;
    const taskCompletion = assignments.length ? (done / assignments.length) * 100 : 60;
    const reports = await TaskReport.find({ employee: emp._id });
    const onTime = reports.filter((r) => !r.isLate).length;
    const timelyReporting = reports.length ? (onTime / reports.length) * 100 : 65;
    const productivity = Math.min(100, taskCompletion * 0.7 + (assignments.reduce((s, a) => s + (a.progress || 0), 0) / Math.max(assignments.length, 1)) * 0.3);
    const metrics = computePerformance({ attendanceRate, taskCompletion, timelyReporting, productivity });
    const review = await PerformanceReview.findOneAndUpdate(
      { employee: emp._id, period },
      { ...metrics, remarks: req.body.remarks },
      { new: true, upsert: true }
    );
    created.push(review);
    await notify(emp.user, {
      type: "performance",
      title: "Performance review published",
      body: `${period}: ${metrics.grade} (${metrics.score})`,
      link: "/performance",
    });
  }
  const items = await PerformanceReview.find({ period }).populate("employee");
  res.json({ success: true, items });
});

export const listReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "employee") filter.employee = req.user.employee._id;
  if (req.user.role === "team_leader") {
    const members = await Employee.find({
      team: req.user.employee.team._id || req.user.employee.team,
    }).select("_id");
    filter.employee = { $in: members.map((m) => m._id) };
  }
  const items = await PerformanceReview.find(filter).populate("employee").sort({ createdAt: -1 });
  res.json({ success: true, items });
});
