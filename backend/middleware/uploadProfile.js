const multer = require("multer");
const path = require("path");
const { ensureDir, UPLOADS_PROFILE } = require("../utils/ensureUploadDirs");

ensureDir(UPLOADS_PROFILE);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      ensureDir(UPLOADS_PROFILE);
      cb(null, UPLOADS_PROFILE);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);

  if (ext && mime) cb(null, true);
  else cb(new Error("Only JPG/PNG allowed"));
};

module.exports = multer({ storage, fileFilter });
