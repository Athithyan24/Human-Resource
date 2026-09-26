import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./config/db.js";
import { errorHandler } from "./utils/apiError.js";
import authRoutes from "./routes/auth.js";
import orgRoutes from "./routes/org.js";
import workRoutes from "./routes/work.js";
import peopleRoutes from "./routes/people.js";
import lifecycleRoutes from "./routes/lifecycle.js";
import hubRoutes from "./routes/hub.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "4mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads")));

app.get("/api/health", (_req, res) => res.json({ ok: true, product: "Arclight HR" }));
app.use("/api/auth", authRoutes);
app.use("/api", orgRoutes);
app.use("/api", workRoutes);
app.use("/api", peopleRoutes);
app.use("/api", lifecycleRoutes);
app.use("/api", hubRoutes);

app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDb(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`Arclight HR API on :${port}`)))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
