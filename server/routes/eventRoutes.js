const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");

// Public: Anyone can see events
router.get("/", eventController.getAllEvents);

// Protected: Only logged-in users (Club Admins) can create
router.post("/", authMiddleware, eventController.createEvent);

// Protected: Get My Club's Events
router.get("/my-events", authMiddleware, eventController.getMyClubEvents);

// Protected: Student Register
router.post("/:id/register", authMiddleware, eventController.registerForEvent);

module.exports = router;