const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    // Sanitize user-provided filename against path traversal
    const baseName = path.basename(file.originalname);
    const sanitizedBase = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(sanitizedBase).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".txt", ".log", ".csv", ".json"];
  const originalBase = path.basename(file.originalname);
  const ext = path.extname(originalBase).toLowerCase();

  // Reject files with path traversal attempts in original name
  if (file.originalname.includes("..") || file.originalname.includes("/") || file.originalname.includes("\\")) {
    return cb(new Error("Path traversal characters are forbidden in filenames."), false);
  }

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file format. Only .txt, .log, .csv, and .json files are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // Strict 15MB limit
    files: 1,
  },
});

module.exports = upload;
