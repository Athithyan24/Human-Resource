import multer from "multer";
import path from "path";
import fs from "fs";

const dir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safe}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /pdf|zip|png|jpe?g|webp|txt|md|docx?/i.test(path.extname(file.originalname));
    cb(ok ? null : new Error("Unsupported file type"), ok);
  },
});
