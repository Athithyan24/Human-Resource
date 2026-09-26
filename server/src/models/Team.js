import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
  },
  { timestamps: true }
);

export const Team = mongoose.model("Team", teamSchema);
