import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    deadline: Date,
    status: {
      type: String,
      enum: ["assigned", "started", "in_progress", "under_review", "completed", "delayed"],
      default: "assigned",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    parentTask: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    attachments: [{ name: String, url: String }],
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
