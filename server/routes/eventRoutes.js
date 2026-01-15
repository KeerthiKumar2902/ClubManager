const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Public: Anyone can see events
router.get("/", eventController.getAllEvents);

// Protected: Only logged-in users (Club Admins) can create
// Protected: Create Event
router.post("/", authMiddleware, upload.single('image'), eventController.createEvent);

// Protected: Get My Club's Events
router.get("/my-events", authMiddleware, eventController.getMyClubEvents);

// Protected: Student Register
router.post("/:id/register", authMiddleware, eventController.registerForEvent);

// Protected: Get My Registrations
router.get("/my-registrations", authMiddleware, eventController.getMyRegistrations);

// Protected Club Admin: Get Attendees
router.get("/:eventId/attendees", authMiddleware, eventController.getEventAttendees);

// Protected Club Admin: Mark Attendance
router.put("/:eventId/attendance", authMiddleware, eventController.markAttendance);

// Student: Cancel Registration
router.delete("/:eventId/cancel", authMiddleware, eventController.cancelRegistration);

// Club Admin: Delete Event
router.delete("/:id", authMiddleware, eventController.deleteEvent);

// Club Admin: Update Event
router.put("/:id", authMiddleware, upload.single('image'), eventController.updateEvent);

module.exports = router;