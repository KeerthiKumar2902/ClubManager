const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require('../middleware/authMiddleware');

// The endpoint will be /api/auth/register
router.post("/register", authController.register);
// The endpoint will be /api/auth/login
router.post("/login", authController.login);
// Update Profile
router.put("/profile", authMiddleware, authController.updateProfile);

module.exports = router;