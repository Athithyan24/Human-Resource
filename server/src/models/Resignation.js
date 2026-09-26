import mongoose from "mongoose";

const resignationSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    reason: String,
    noticeStart: Date,
    noticeEnd: Date,
    status: {
      type: String,
      enum: ["submitted", "notice", "clearance", "completed"],
      default: "submitted",
    },
    clearance: {
      assets: { type: Boolean, default: false },
      knowledge: { type: Boolean, default: false },
      finance: { type: Boolean, default: false },
    },
    finalStatus: String,
  },
  { timestamps: true }
);

export const Resignation = mongoose.model("Resignation", resignationSchema);
