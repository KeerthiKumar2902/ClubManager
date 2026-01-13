const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// The endpoint will be /api/auth/register
router.post("/register", authController.register);
// The endpoint will be /api/auth/login
router.post("/login", authController.login);

module.exports = router;