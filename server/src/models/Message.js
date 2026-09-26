import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    text: { type: String, required: true },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
