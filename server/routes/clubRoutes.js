const express = require("express");
const router = express.Router();
const clubController = require("../controllers/clubController");
const authenticateUser = require("../middleware/authMiddleware"); 

// --- 1. Get All Clubs (Public) ---
router.get("/", clubController.getAllClubs);

// --- 2. Request to start a club (Student) ---
router.post("/request", authenticateUser, clubController.requestClub);

// --- 3. View all requests (Super Admin) ---
router.get("/requests", authenticateUser, (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "Access denied" });
  next();
}, clubController.getAllRequests);

// --- 4. Approve/Reject a request (Super Admin) ---
router.put("/requests/:requestId", authenticateUser, (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "Access denied" });
  next();
}, clubController.processClubRequest);

// --- 5. Manual Create (Super Admin) ---
router.post("/", authenticateUser, (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "Access denied" });
  next();
}, clubController.createClub);

// --- 6. Delete a club (Super Admin) ---
router.delete("/:id", authenticateUser, (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "Access denied" });
  next();
}, clubController.deleteClub);

// --- 7. Update Club (Club Admin / Super Admin) ---
router.put("/:id", authenticateUser, clubController.updateClub);

// --- MEMBER ROUTES ---

// Protected: Get My Joined Clubs (MUST BE BEFORE /:id) <--- CRITICAL FIX
router.get('/my-memberships', authenticateUser, clubController.getMyMemberships);

// Public: View a single club's profile (Dynamic Route)
router.get('/:id', clubController.getClubProfile);

// Protected: Join/Leave
router.post('/:id/join', authenticateUser, clubController.joinClub);
router.delete('/:id/leave', authenticateUser, clubController.leaveClub);

// Protected: View Members (Admin Only)
router.get('/:id/members', authenticateUser, clubController.getClubMembers);

module.exports = router;