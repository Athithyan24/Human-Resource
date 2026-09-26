import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const EmployeeActivityLog = mongoose.model("EmployeeActivityLog", logSchema);
