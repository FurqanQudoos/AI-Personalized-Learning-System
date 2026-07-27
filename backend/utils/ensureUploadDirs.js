const fs = require("fs");
const path = require("path");

const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
const UPLOADS_AI = path.join(UPLOADS_ROOT, "ai");
const UPLOADS_PROFILE = path.join(UPLOADS_ROOT, "profile");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o775 });

  try {
    fs.chmodSync(dir, 0o775);
  } catch (_) {
    // chmod may fail on some hosts; directory still usable if owned by process user
  }
}

function ensureUploadDirs() {
  ensureDir(UPLOADS_ROOT);
  ensureDir(UPLOADS_AI);
  ensureDir(UPLOADS_PROFILE);
}

module.exports = {
  ensureDir,
  ensureUploadDirs,
  UPLOADS_ROOT,
  UPLOADS_AI,
  UPLOADS_PROFILE,
};
