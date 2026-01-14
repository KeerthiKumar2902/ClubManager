const express = require("express");
const router = express.Router();
const clubController = require("../controllers/clubController");
const authMiddleware = require("../middleware/authMiddleware");

// Public: View all clubs
router.get("/", clubController.getAllClubs);

// Student: Request to start a club
router.post("/request", authMiddleware, clubController.requestClub);

// Super Admin: View all requests
router.get("/requests", authMiddleware, (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "Access denied" });
  next();
}, clubController.getAllRequests);

// Super Admin: Approve/Reject a request
router.put("/requests/:requestId", authMiddleware, (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "Access denied" });
  next();
}, clubController.processClubRequest);

// Super Admin: Delete a club
router.delete("/:id", authMiddleware, (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "Access denied" });
  next();
}, clubController.deleteClub);

// Club Admin: Update their own club details
router.put("/:id", authMiddleware, (req, res, next) => {
    // Ideally check if req.user.id is the owner of club :id
    if (req.user.role === "STUDENT") return res.status(403).json({ error: "Access denied" });
    next();
}, clubController.updateClub);

module.exports = router;