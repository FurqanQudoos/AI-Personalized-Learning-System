const nodemailer = require("nodemailer");

/**
 * Send Email Utility
 * Uses Gmail + App Password
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,          // ✅ CHANGE
      secure: false,      // ✅ CHANGE
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `AI Learning Companion <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email send error:", error.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
