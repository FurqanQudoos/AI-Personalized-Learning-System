require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const passport = require("./config/passport");
const session = require("express-session");
const {
  ensureUploadDirs,
  UPLOADS_ROOT,
} = require("./utils/ensureUploadDirs");

// Ensure upload folders exist before handling requests
ensureUploadDirs();

// Routes
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
const app = express();

/* =========================
   MIDDLEWARE
========================= */

// Enable CORS for frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse incoming JSON
app.use(express.json());

app.use("/uploads", express.static(UPLOADS_ROOT));

app.use(
  session({
    secret: "google-secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/api/insights", insightsRoutes);

app.use(passport.initialize());
app.use(passport.session());
app.use("/api/admin", adminRoutes);
app.use("/api", aiRoutes);
/* =========================
   DATABASE CONNECTION
========================= */
connectDB();

/* =========================
   API ROUTES
========================= */

// User auth routes
app.use("/api/users", userRoutes);

// Contact form routes
app.use("/api/contact", contactRoutes); // ✅ ADDED

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Learning Companion Backend is running",
  });
});

/* =========================
   ERROR HANDLER (Professional)
========================= */
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`Server running on ${BACKEND_URL}`);
});
