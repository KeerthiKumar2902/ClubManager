const express = require("express");
const router = express.Router();
const clubController = require("../controllers/clubController");
const authMiddleware = require("../middleware/authMiddleware");

// Protect this route! Only logged-in users can access it.
// (Ideally only SUPER_ADMIN, but we start with basic auth)
router.post("/", authMiddleware, clubController.createClub);

// Get All Clubs (Public or Admin)
router.get("/", clubController.getAllClubs);

module.exports = router;