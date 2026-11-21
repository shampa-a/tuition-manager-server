import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadDirectory = path.resolve(
  process.cwd(),
  "private_uploads",
  "student-ids"
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(
      new Error("Only JPG, PNG, and WebP images are allowed")
    );
    return;
  }

  cb(null, true);
};

export const uploadStudentIdCard = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
});