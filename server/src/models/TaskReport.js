import mongoose from "mongoose";

const taskReportSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    workDone: { type: String, required: true },
    currentProgress: String,
    blockers: String,
    nextActivity: String,
    slot: { type: String, required: true },
    date: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    isLate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taskReportSchema.index({ employee: 1, date: 1, slot: 1 }, { unique: true });

export const TaskReport = mongoose.model("TaskReport", taskReportSchema);
