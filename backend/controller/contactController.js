const Contact = require("../models/Contact");

/* =========================
   CREATE CONTACT MESSAGE
========================= */
exports.createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 🔴 Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ✅ Save to database
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Contact Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

/* =========================
   GET ALL CONTACT MESSAGES (Admin/Future use)
========================= */
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
