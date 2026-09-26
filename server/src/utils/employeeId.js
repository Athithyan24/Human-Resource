import { Counter } from "../models/Counter.js";

export async function nextEmployeeId() {
  const doc = await Counter.findOneAndUpdate(
    { key: "employee" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `EMP${String(doc.seq).padStart(5, "0")}`;
}
