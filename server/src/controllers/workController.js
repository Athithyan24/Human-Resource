import { Task } from "../models/Task.js";
import { TaskAssignment } from "../models/TaskAssignment.js";
import { TaskReport } from "../models/TaskReport.js";
import { Employee } from "../models/Employee.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { notify } from "../utils/notify.js";

const REPORT_SLOTS = ["10:00", "12:00", "14:00", "16:00"];

function isLateSlot(slot) {
  const [h, m] = slot.split(":").map(Number);
  const now = new Date();
  const due = new Date();
  due.setHours(h, m + 15, 0, 0);
  return now > due;
}

export const listTasks = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.team) filter.assignedTeam = req.query.team;
  if (req.user.role === "team_leader" && req.user.employee?.team) {
    filter.assignedTeam = req.user.employee.team._id || req.user.employee.team;
  }
  if (req.user.role === "employee") {
    const mine = await TaskAssignment.find({ employee: req.user.employee._id }).select("task");
    filter._id = { $in: mine.map((a) => a.task) };
  }
  const items = await Task.find(filter)
    .populate("assignedTeam createdBy parentTask")
    .sort({ createdAt: -1 });
  const withAssignments = await Promise.all(
    items.map(async (task) => {
      const assignments = await TaskAssignment.find({ task: task._id }).populate("employee");
      return { ...task.toObject(), assignments };
    })
  );
  res.json({ success: true, items: withAssignments });
});

export const createTask = asyncHandler(async (req, res) => {
  const { memberIds = [], ...rest } = req.body;
  if (req.user.role === "team_leader") {
    rest.assignedTeam = req.user.employee.team._id || req.user.employee.team;
  }
  const task = await Task.create({ ...rest, createdBy: req.user._id });
  const ids = Array.isArray(memberIds) ? memberIds : [];
  await TaskAssignment.insertMany(
    ids.map((employee) => ({ task: task._id, employee, status: "assigned" }))
  );
  const employees = await Employee.find({ _id: { $in: ids } });
  for (const emp of employees) {
    await notify(emp.user, {
      type: "task",
      title: "New task assigned",
      body: task.title,
      link: `/work/${task._id}`,
    });
  }
  const populated = await Task.findById(task._id).populate("assignedTeam");
  const assignments = await TaskAssignment.find({ task: task._id }).populate("employee");
  res.status(201).json({ success: true, item: { ...populated.toObject(), assignments } });
});

export const updateTask = asyncHandler(async (req, res) => {
  const item = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) throw new ApiError(404, "Task not found");
  res.json({ success: true, item });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const item = await TaskAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
    "employee task"
  );
  if (!item) throw new ApiError(404, "Assignment not found");
  if (req.body.status === "under_review") {
    const leader = await Employee.findById(item.employee.manager);
    if (leader?.user) {
      await notify(leader.user, {
        type: "review",
        title: "Submission ready for review",
        body: item.task?.title,
        link: `/reviews`,
      });
    }
  }
  res.json({ success: true, item });
});

export const addDeliverable = asyncHandler(async (req, res) => {
  const assignment = await TaskAssignment.findById(req.params.id);
  if (!assignment) throw new ApiError(404, "Assignment not found");
  const file = req.file;
  assignment.deliverables.push({
    name: req.body.name || file?.originalname || "Deliverable",
    url: file ? `/uploads/${file.filename}` : req.body.url,
    kind: req.body.kind || "file",
  });
  assignment.status = "under_review";
  await assignment.save();
  res.json({ success: true, item: assignment });
});

export const submitReport = asyncHandler(async (req, res) => {
  if (!req.user.employee) throw new ApiError(400, "No employee profile");
  const date = new Date().toISOString().slice(0, 10);
  const slot = req.body.slot;
  if (!REPORT_SLOTS.includes(slot)) throw new ApiError(400, "Invalid report slot");
  const item = await TaskReport.create({
    employee: req.user.employee._id,
    task: req.body.task,
    workDone: req.body.workDone,
    currentProgress: req.body.currentProgress,
    blockers: req.body.blockers,
    nextActivity: req.body.nextActivity,
    slot,
    date,
    isLate: isLateSlot(slot),
  });
  res.status(201).json({ success: true, item });
});

export const listReports = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "employee") filter.employee = req.user.employee._id;
  if (req.user.role === "team_leader") {
    const members = await Employee.find({
      team: req.user.employee.team._id || req.user.employee.team,
    }).select("_id");
    filter.employee = { $in: members.map((m) => m._id) };
  }
  if (req.query.date) filter.date = req.query.date;
  const items = await TaskReport.find(filter).populate("employee task").sort({ createdAt: -1 });
  res.json({ success: true, items, slots: REPORT_SLOTS });
});

export const myReportStatus = asyncHandler(async (req, res) => {
  if (!req.user.employee) return res.json({ success: true, slots: REPORT_SLOTS, submitted: [] });
  const date = new Date().toISOString().slice(0, 10);
  const submitted = await TaskReport.find({ employee: req.user.employee._id, date });
  res.json({ success: true, date, slots: REPORT_SLOTS, submitted });
});

export const searchAll = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ success: true, employees: [], tasks: [] });
  const employees = await Employee.find({
    $or: [
      { firstName: new RegExp(q, "i") },
      { lastName: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
      { employeeId: new RegExp(q, "i") },
    ],
  }).limit(8);
  const tasks = await Task.find({ title: new RegExp(q, "i") }).limit(8);
  res.json({ success: true, employees, tasks });
});
