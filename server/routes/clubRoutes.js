const express = require("express");
const router = express.Router();
const clubController = require("../controllers/clubController");
const authenticateUser = require("../middleware/authMiddleware"); 
const upload = require("../middleware/upload");

// --- 1. SPECIFIC ROUTES (MUST BE AT THE TOP) ---

router.get("/", clubController.getAllClubs);

// Student Feeds
router.get('/my-announcements', authenticateUser, clubController.getMyAnnouncements);
router.get('/my-memberships', authenticateUser, clubController.getMyMemberships);

// Student Actions
router.post("/request", authenticateUser, clubController.requestClub);

// Super Admin Actions
router.get("/requests", authenticateUser, (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "Access denied" });
  next();
}, clubController.getAllRequests);

router.post("/", authenticateUser, (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "Access denied" });
  next();
}, clubController.createClub);

// --- 2. DYNAMIC ROUTES (/:id ...) ---

// Club Actions
router.put("/requests/:requestId", authenticateUser, (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "Access denied" });
  next();
}, clubController.processClubRequest);

router.delete("/:id", authenticateUser, (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "Access denied" });
  next();
}, clubController.deleteClub);

// --- CRITICAL FIX: Only ONE update route with upload middleware ---
router.put("/:id", authenticateUser, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), clubController.updateClub);
// -----------------------------------------------------------------

// Profile
router.get('/:id', clubController.getClubProfile);

// Membership Logic
router.post('/:id/join', authenticateUser, clubController.joinClub);
router.delete('/:id/leave', authenticateUser, clubController.leaveClub);
router.get('/:id/members', authenticateUser, clubController.getClubMembers);
router.delete('/:id/members/:studentId', authenticateUser, clubController.removeMember);

// Announcement Logic
router.post('/:id/announcements', authenticateUser, clubController.postAnnouncement);
router.get('/:id/announcements', authenticateUser, clubController.getClubAnnouncements);

module.exports = router;