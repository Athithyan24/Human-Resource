import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    kind: { type: String, enum: ["program", "workshop", "course", "material"], default: "program" },
    description: String,
    materialUrl: String,
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    completions: [
      {
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        completedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

export const TrainingProgram = mongoose.model("TrainingProgram", trainingSchema);
