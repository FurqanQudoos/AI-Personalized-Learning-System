const express = require("express");
const multer = require("multer");
const path = require("path");

const protect = require("../middleware/authMiddleware");
const { ensureDir, UPLOADS_AI } = require("../utils/ensureUploadDirs");

const {
  analyzePaper,
  teachStudent,
  chatWithTutor,
  generateQuiz,
  submitQuiz,
} = require("../controller/aiController");

const router = express.Router();

ensureDir(UPLOADS_AI);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      ensureDir(UPLOADS_AI);
      cb(null, UPLOADS_AI);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
});

router.post("/analyze", protect, upload.single("image"), analyzePaper);
router.post("/teach", protect, teachStudent);
router.post("/chat", protect, chatWithTutor);
router.post("/quiz", protect, generateQuiz);
router.post("/submit-quiz", protect, submitQuiz);

module.exports = router;
