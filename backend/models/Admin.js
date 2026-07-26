const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

/* SIMPLE PASSWORD MATCH (NO HASH) */
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return enteredPassword === this.password;
};

module.exports = mongoose.model("Admin", adminSchema);