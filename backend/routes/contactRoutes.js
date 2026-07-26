const express = require("express");
const router = express.Router();

const {
  createContact,
  getAllContacts,
} = require("../controller/contactController");

/* =========================
   CONTACT ROUTES
========================= */

// 📩 Submit contact form (Public)
router.post("/", createContact);

// 📥 Get all contact messages (Admin / Future use)
router.get("/", getAllContacts);

module.exports = router;
