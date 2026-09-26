import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    fromDesignation: String,
    toDesignation: String,
    fromTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    toTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    fromDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    toDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    kind: { type: String, enum: ["promotion", "transfer", "reward"], default: "promotion" },
    note: String,
    effectiveDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Promotion = mongoose.model("Promotion", promotionSchema);
