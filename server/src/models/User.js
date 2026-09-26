import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "team_leader", "employee"],
      required: true,
    },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
