import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    photo: String,
    joiningDate: { type: Date, default: Date.now },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    designation: String,
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    status: {
      type: String,
      enum: ["hired", "onboarding", "active", "on_notice", "exited"],
      default: "onboarding",
    },
    lifecycleStage: {
      type: String,
      enum: ["hiring", "onboarding", "active", "promotion", "transfer", "resignation", "exit"],
      default: "onboarding",
    },
  },
  { timestamps: true }
);

employeeSchema.index({ firstName: "text", lastName: "text", email: "text", employeeId: "text" });

export const Employee = mongoose.model("Employee", employeeSchema);
