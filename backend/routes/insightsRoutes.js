const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const controller = require("../controller/insightsController");

router.get("/", protect, controller.getInsights);

module.exports = router;