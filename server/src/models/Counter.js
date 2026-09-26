import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model("Counter", counterSchema);
