import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["policy", "guideline", "offer", "hr", "training"],
      default: "policy",
    },
    description: String,
    fileUrl: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);
