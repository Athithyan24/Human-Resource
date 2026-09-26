import mongoose from "mongoose";

const taskAssignmentSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    status: {
      type: String,
      enum: ["assigned", "started", "in_progress", "under_review", "completed", "delayed"],
      default: "assigned",
    },
    progress: { type: Number, default: 0 },
    deliverables: [{ name: String, url: String, kind: String }],
    notes: String,
  },
  { timestamps: true }
);

export const TaskAssignment = mongoose.model("TaskAssignment", taskAssignmentSchema);
