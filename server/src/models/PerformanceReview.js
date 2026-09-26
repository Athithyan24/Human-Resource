import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    period: { type: String, required: true },
    attendanceRate: Number,
    taskCompletion: Number,
    timelyReporting: Number,
    productivity: Number,
    score: Number,
    grade: String,
    remarks: String,
  },
  { timestamps: true }
);

export const PerformanceReview = mongoose.model("PerformanceReview", performanceSchema);
