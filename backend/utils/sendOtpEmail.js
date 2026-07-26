const sendEmail = require("../config/email");

/**
 * Send OTP verification email
 * @param {string} email
 * @param {string} otp
 */
const sendOtpEmail = async (email, otp) => {
  const message = `
    <div style="font-family: Arial, sans-serif; background:#f4f6fb; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:10px;">
        
        <h2 style="color:#2563eb; text-align:center;">
          AI Learning Companion
        </h2>

        <p>Hello,</p>

        <p>
          Your verification code is:
        </p>

        <h1 style="text-align:center; letter-spacing:5px; color:#111;">
          ${otp}
        </h1>

        <p style="text-align:center;">
          This OTP will expire in <strong>1 minute</strong>.
        </p>

        <p>
          If you did not request this, please ignore this email.
        </p>

        <hr style="margin:30px 0;" />

        <p style="font-size:12px; color:#777; text-align:center;">
          © 2025 AI Learning Companion. All rights reserved.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Email Verification OTP",
    html: message,
  });
};

module.exports = sendOtpEmail;