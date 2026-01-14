const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Rate Limited Public Routes
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);

// Password Reset Flow
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);

// Email Verification
router.post("/verify-email", authController.verifyEmail);

// Protected Routes
router.put("/profile", authMiddleware, authController.updateProfile);

module.exports = router;