const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/upload");

// Rate Limited Public Routes
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);

// Password Reset Flow
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);

// Email Verification
router.post("/verify-email", authController.verifyEmail);

// Protected Routes
router.put(
  "/profile",
  authMiddleware,
  upload.single("avatar"),
  authController.updateProfile,
);

// 1. Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// 2. Google Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    // This runs ONLY if login successful
    const user = req.user;

    // Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Redirect to Frontend with Token
    res.redirect(
      `${frontendUrl}/google-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`,
    );
  },
);

module.exports = router;
