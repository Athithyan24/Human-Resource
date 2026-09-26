import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: String, required: true },
    checkIn: Date,
    checkOut: Date,
    workingHours: { type: Number, default: 0 },
    late: { type: Boolean, default: false },
    earlyExit: { type: Boolean, default: false },
    status: { type: String, enum: ["present", "absent", "late", "half_day"], default: "present" },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
