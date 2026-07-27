const express = require("express");
const upload = require("../middleware/uploadProfile");
const router = express.Router();
const passport = require("passport");

const {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  verifyOtp, // 🔥 ADD THIS
} = require("../controller/userController");

const protect = require("../middleware/authMiddleware");

/* =========================
   AUTH ROUTES
========================= */

// Register with profile image upload
router.post("/register", upload.single("profileImage"), registerUser);

// 🔥 VERIFY OTP (NEW)
router.post("/verify-otp", verifyOtp);

// Login
router.post("/login", loginUser);

// Update profile (Protected)
router.put(
  "/update-profile",
  protect,
  upload.single("profileImage"),
  require("../controller/userController").updateUserProfile
);

// Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const { user, token } = req.user;

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(
      `${frontendUrl}/google-success?token=${token}&name=${user.name}&email=${user.email}&image=${user.profileImage}`
    );
  }
);

// Forgot Password (PUBLIC)
router.post("/forgot-password", forgotPassword);

// Reset Password (PUBLIC)
router.put("/reset-password/:token", resetPassword);

// Get logged-in user profile (Protected)
router.get("/profile", protect, getUserProfile);

module.exports = router;