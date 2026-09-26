import { Attendance } from "../models/Attendance.js";
import { LeaveRequest } from "../models/LeaveRequest.js";
import { Employee } from "../models/Employee.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { notify } from "../utils/notify.js";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function hoursBetween(a, b) {
  return Math.round(((b - a) / 36e5) * 100) / 100;
}

export const checkIn = asyncHandler(async (req, res) => {
  if (!req.user.employee) throw new ApiError(400, "No employee profile");
  const date = today();
  const existing = await Attendance.findOne({ employee: req.user.employee._id, date });
  if (existing?.checkIn) throw new ApiError(400, "Already checked in today");
  const now = new Date();
  const lateLimit = new Date();
  lateLimit.setHours(10, 15, 0, 0);
  const late = now > lateLimit;
  const item = await Attendance.findOneAndUpdate(
    { employee: req.user.employee._id, date },
    { checkIn: now, late, status: late ? "late" : "present" },
    { new: true, upsert: true }
  );
  res.json({ success: true, item });
});

export const checkOut = asyncHandler(async (req, res) => {
  if (!req.user.employee) throw new ApiError(400, "No employee profile");
  const date = today();
  const item = await Attendance.findOne({ employee: req.user.employee._id, date });
  if (!item?.checkIn) throw new ApiError(400, "Check in first");
  if (item.checkOut) throw new ApiError(400, "Already checked out");
  const now = new Date();
  const earlyLimit = new Date();
  earlyLimit.setHours(17, 0, 0, 0);
  item.checkOut = now;
  item.workingHours = hoursBetween(item.checkIn, now);
  item.earlyExit = now < earlyLimit;
  await item.save();
  res.json({ success: true, item });
});

export const listAttendance = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.date) filter.date = req.query.date;
  else filter.date = today();
  if (req.user.role === "employee") filter.employee = req.user.employee._id;
  if (req.user.role === "team_leader") {
    const members = await Employee.find({
      team: req.user.employee.team._id || req.user.employee.team,
    }).select("_id");
    filter.employee = { $in: members.map((m) => m._id) };
  }
  const items = await Attendance.find(filter).populate("employee").sort({ date: -1 });
  const present = items.filter((i) => i.status === "present" || i.status === "late").length;
  const late = items.filter((i) => i.late).length;
  res.json({ success: true, items, metrics: { present, late, records: items.length } });
});

export const heatmap = asyncHandler(async (req, res) => {
  const employeeId = req.query.employee || req.user.employee?._id;
  const items = await Attendance.find({ employee: employeeId }).sort({ date: 1 }).limit(90);
  res.json({ success: true, items });
});

export const applyLeave = asyncHandler(async (req, res) => {
  if (!req.user.employee) throw new ApiError(400, "No employee profile");
  const item = await LeaveRequest.create({
    employee: req.user.employee._id,
    type: req.body.type,
    from: req.body.from,
    to: req.body.to,
    reason: req.body.reason,
  });
  const leader = req.user.employee.manager;
  if (leader) {
    const mgr = await Employee.findById(leader);
    if (mgr?.user) {
      await notify(mgr.user, {
        type: "leave",
        title: "Leave request pending",
        body: `${req.user.employee.firstName} applied for ${req.body.type} leave`,
        link: "/leaves",
      });
    }
  }
  res.status(201).json({ success: true, item });
});

export const listLeaves = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "employee") filter.employee = req.user.employee._id;
  if (req.user.role === "team_leader") {
    const members = await Employee.find({
      team: req.user.employee.team._id || req.user.employee.team,
    }).select("_id");
    filter.employee = { $in: members.map((m) => m._id) };
  }
  if (req.query.status) filter.status = req.query.status;
  const items = await LeaveRequest.find(filter).populate("employee reviewedBy").sort({ createdAt: -1 });
  res.json({ success: true, items });
});

export const reviewLeave = asyncHandler(async (req, res) => {
  const item = await LeaveRequest.findById(req.params.id).populate("employee");
  if (!item) throw new ApiError(404, "Leave not found");
  item.status = req.body.status;
  item.reviewNote = req.body.reviewNote;
  item.reviewedBy = req.user.employee?._id;
  await item.save();
  const empUser = await User.findOne({ employee: item.employee._id });
  await notify(empUser?._id, {
    type: "leave",
    title: `Leave ${item.status}`,
    body: item.reviewNote || `Your ${item.type} leave was ${item.status}`,
    link: "/leaves",
  });
  res.json({ success: true, item });
});
