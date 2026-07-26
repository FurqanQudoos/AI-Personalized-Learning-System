const express = require("express");
const router = express.Router();

const { adminLogin } = require("../controller/adminController");
const adminProtect = require("../middleware/adminMiddleware");

const User = require("../models/User");
const Contact = require("../models/Contact");

/* LOGIN */
router.post("/login", adminLogin);

/* DASHBOARD STATS */
router.get("/stats", adminProtect, async (req, res) => {
  const users = await User.countDocuments();
  const messages = await Contact.countDocuments();

  res.json({
    users,
    messages,
    uploads: 0, // future use
  });
});

/* GET USERS */
/* GET USERS + ADMINS */
router.get("/users", adminProtect, async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 🔥 UPDATE STATUS
    await User.updateMany(
      {
        lastLogin: { $lt: sevenDaysAgo },
        status: { $ne: "deleted" }
      },
      { status: "inactive" }
    );

    await User.updateMany(
      {
        lastLogin: { $gte: sevenDaysAgo },
        status: { $ne: "deleted" }
      },
      { status: "active" }
    );

    // FETCH USERS
    const users = await User.find();

    const admins = await Admin.find();

    const adminWithRole = admins.map((a) => ({
      ...a._doc,
      role: "Admin",
      status: "active", // admins always active
    }));

    const allUsers = [...users, ...adminWithRole];

    res.json(allUsers);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* DELETE USER */
/* DELETE USER OR ADMIN */
router.delete(
  "/users/:id",
  adminProtect,
  async (req, res) => {

    try {

      const user =
        await User.findById(req.params.id);

      if (!user) {

        return res.status(404).json({
          message: "User not found",
        });
      }

      await user.deleteOne();

      res.json({
        message: "User deleted",
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* GET CONTACTS */
router.get("/contacts", adminProtect, async (req, res) => {
  const contacts = await Contact.find();
  res.json(contacts);
});

/* DELETE CONTACT */
router.delete("/contacts/:id", adminProtect, async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* ADD USER */
/* ADD USER / ADMIN */
const Admin = require("../models/Admin");

router.post("/users", adminProtect, async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (role === "Admin") {
      // 🔴 CREATE ADMIN
      const adminExists = await Admin.findOne({ email });

      if (adminExists) {
        return res.status(400).json({ message: "Admin already exists" });
      }

      const admin = await Admin.create({
        name,
        email,
        password,
      });

      return res.json({ message: "Admin created", admin });
    } else {
      // 🟢 CREATE STUDENT
      const userExists = await User.findOne({ email });

      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await User.create({

  name,
  email,
  password,

  role: "Student",

  isVerified: true,

  status: "active",
});

      return res.json({ message: "User created", user });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* UPDATE USER */
router.put("/users/:id", adminProtect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
/* UPDATE USER STATUS */
router.put("/users/status/:id", adminProtect, async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.status = status;
    if (status === "deleted") {

  user.deletedAt = new Date();

  user.deletedBy = req.admin.name;
}

    await user.save();

    res.json({
      message: "Status updated",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;