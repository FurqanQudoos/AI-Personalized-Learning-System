const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendResetEmail = require("../utils/sendResetEmail");
const sendOtpEmail = require("../utils/sendOtpEmail");

/* 🔑 Generate JWT */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/* =========================
   REGISTER
========================= */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const profileImage = req.file
      ? `/uploads/profile/${req.file.filename}`
      : "/uploads/profile/default.png";

    // 🔥 GENERATE OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // hash for DB
    const otp = crypto
      .createHash("sha256")
      .update(rawOtp)
      .digest("hex");

    const otpExpire = Date.now() + 60 * 1000;

    // ⚠️ CREATE USER (not saved yet)
    const user = new User({
      name,
      email,
      password,
      profileImage,
      otp,
      otpExpire,
      isVerified: false,
    });

    // 🔥 SEND EMAIL FIRST
    await sendOtpEmail(email, rawOtp);

    // ✅ SAVE ONLY IF EMAIL SUCCESS
    await user.save();

    res.status(201).json({
      message: "OTP sent to your email",
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error); // 🔥 important

    res.status(500).json({
      message: error.message || "Email could not be sent",
    });
  }
};
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ message: "Already verified" });
    }

    // 🔥 HASH USER INPUT OTP
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (user.otp !== hashedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // ✅ VERIFY USER
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.json({
      message: "Email verified successfully",
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   LOGIN
========================= */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isVerified) {
  return res.status(401).json({ message: "Please verify email first" });
}
if (user.status === "deleted") {

  return res.status(403).json({
    message:
      "Your account has been deleted by admin",
  });
}

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // UPDATE LAST LOGIN
    user.lastLogin = Date.now();
    user.status = "active"; // agar inactive tha to wapas active ho jaye
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   FORGOT PASSWORD (FINAL)
========================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Reset URL
    const resetUrl = `http://localhost:5173/reset/${resetToken}`;

    // Send email
    await sendResetEmail(user.email, resetUrl);

    res.json({
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Email could not be sent. Please try again later.",
    });
  }
};

/* =========================
   RESET PASSWORD
========================= */
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET USER PROFILE
========================= */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE USER PROFILE
========================= */
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* -------- NAME UPDATE -------- */
    if (req.body.name) {
      user.name = req.body.name;
    }

    /* -------- PASSWORD UPDATE -------- */
    if (req.body.oldPassword && req.body.newPassword) {
      const isMatch = await user.matchPassword(req.body.oldPassword);

      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      user.password = req.body.newPassword;
    }

    /* -------- IMAGE UPDATE -------- */
    if (req.file) {
      user.profileImage = `/uploads/profile/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
