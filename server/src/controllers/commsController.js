import { Announcement } from "../models/Announcement.js";
import { Document } from "../models/Document.js";
import { TrainingProgram } from "../models/TrainingProgram.js";
import { Message } from "../models/Message.js";
import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

export const listAnnouncements = asyncHandler(async (_req, res) => {
  const items = await Announcement.find().populate("createdBy", "username role").sort({ createdAt: -1 });
  res.json({ success: true, items });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const item = await Announcement.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, item });
});

export const listDocuments = asyncHandler(async (_req, res) => {
  const items = await Document.find().sort({ createdAt: -1 });
  res.json({ success: true, items });
});

export const createDocument = asyncHandler(async (req, res) => {
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl;
  const item = await Document.create({
    ...req.body,
    fileUrl,
    uploadedBy: req.user._id,
  });
  res.status(201).json({ success: true, item });
});

export const listTraining = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role !== "admin" && req.user.employee) {
    filter.assignedTo = req.user.employee._id;
  }
  const items = await TrainingProgram.find(filter).populate("assignedTo").sort({ createdAt: -1 });
  res.json({ success: true, items });
});

export const createTraining = asyncHandler(async (req, res) => {
  const item = await TrainingProgram.create(req.body);
  res.status(201).json({ success: true, item });
});

export const completeTraining = asyncHandler(async (req, res) => {
  const item = await TrainingProgram.findById(req.params.id);
  if (!item) throw new ApiError(404, "Program not found");
  const empId = req.user.employee._id;
  if (!item.completions.some((c) => String(c.employee) === String(empId))) {
    item.completions.push({ employee: empId, completedAt: new Date() });
    await item.save();
  }
  res.json({ success: true, item });
});

export const listMessages = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.team) filter.team = req.query.team;
  if (req.query.task) filter.task = req.query.task;
  if (!filter.team && !filter.task && req.user.employee?.team) {
    filter.team = req.user.employee.team._id || req.user.employee.team;
  }
  const items = await Message.find(filter).populate("from mentions").sort({ createdAt: 1 }).limit(200);
  res.json({ success: true, items });
});

export const postMessage = asyncHandler(async (req, res) => {
  const item = await Message.create({
    from: req.user._id,
    team: req.body.team || req.user.employee?.team,
    task: req.body.task,
    text: req.body.text,
    mentions: req.body.mentions || [],
  });
  const populated = await Message.findById(item._id).populate("from mentions");
  res.status(201).json({ success: true, item: populated });
});

export const listNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, items });
});

export const markRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true });
});
