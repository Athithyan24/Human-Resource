import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: String,
    title: { type: String, required: true },
    body: String,
    link: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
