import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    type: { type: String, enum: ["casual", "sick", "emergency"], required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    reviewNote: String,
  },
  { timestamps: true }
);

export const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
