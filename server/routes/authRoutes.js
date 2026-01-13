const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// The endpoint will be /api/auth/register
router.post("/register", authController.register);

module.exports = router;