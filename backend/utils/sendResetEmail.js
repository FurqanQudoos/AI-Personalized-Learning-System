const sendEmail = require("../config/email");

/**
 * Send password reset email
 * @param {string} email - user email
 * @param {string} resetUrl - frontend reset link
 */
const sendResetEmail = async (email, resetUrl) => {
  const message = `
    <div style="font-family: Arial, sans-serif; background:#f4f6fb; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:10px;">
        
        <h2 style="color:#2563eb; text-align:center;">
          AI Learning Companion
        </h2>

        <p>Hello,</p>

        <p>
          You requested to reset your password for your 
          <strong>AI Learning Companion</strong> account.
        </p>

        <p style="text-align:center; margin:30px 0;">
          <a 
            href="${resetUrl}" 
            style="
              background:#2563eb;
              color:#ffffff;
              padding:12px 22px;
              text-decoration:none;
              border-radius:6px;
              font-weight:bold;
              display:inline-block;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This reset link will expire in 
          <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request this password reset, please ignore this email.
          Your account will remain secure.
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
    subject: "Password Reset - AI Learning Companion",
    html: message,
  });
};

module.exports = sendResetEmail;
