const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// --- 1. EXISTING: Get All Clubs (Public) ---
exports.getAllClubs = async (req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      include: { 
        admin: { select: { name: true, email: true } },
        events: true 
      }
    });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
};

// --- 2. NEW: Student Requests a Club ---
exports.requestClub = async (req, res) => {
  try {
    const { name, description } = req.body;
    const studentId = req.user.id; // From authMiddleware

    // Check if club name already exists
    const existingClub = await prisma.club.findUnique({ where: { name } });
    if (existingClub) {
      return res.status(400).json({ error: "Club name already taken" });
    }

    // Check if user already has a pending request (prevent spam)
    const existingRequest = await prisma.clubRequest.findFirst({
      where: { studentId, status: "PENDING" }
    });
    if (existingRequest) {
      return res.status(400).json({ error: "You already have a pending request." });
    }

    const request = await prisma.clubRequest.create({
      data: {
        name,
        description,
        studentId
      }
    });

    res.status(201).json({ message: "Request submitted successfully!", request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit request" });
  }
};

// --- 3. NEW: Admin Views All Requests ---
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await prisma.clubRequest.findMany({
      include: {
        student: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' } // Newest first
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// --- 4. NEW: Admin Approves/Rejects Request ---
exports.processClubRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // "APPROVED" or "REJECTED"

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const request = await prisma.clubRequest.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ error: "Request not found" });

    if (request.status !== "PENDING") {
      return res.status(400).json({ error: "Request already processed" });
    }

    // --- LOGIC A: REJECTION ---
    if (status === "REJECTED") {
      await prisma.clubRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" }
      });
      return res.json({ message: "Club request rejected." });
    }

    // --- LOGIC B: APPROVAL (The Big Transaction) ---
    // We must: 1. Create Club, 2. Promote User, 3. Update Request Status
    await prisma.$transaction(async (tx) => {
      // 1. Create the Club
      const newClub = await tx.club.create({
        data: {
          name: request.name,
          description: request.description,
          adminId: request.studentId
        }
      });

      // 2. Upgrade User Role
      await tx.user.update({
        where: { id: request.studentId },
        data: { role: "CLUB_ADMIN" }
      });

      // 3. Mark Request as Approved
      await tx.clubRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" }
      });
    });

    res.json({ message: "Club approved and created successfully!" });

  } catch (error) {
    console.error("Process Error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
};

// --- 5. EXISTING: Delete Club (Manual Admin Cleanup) ---
exports.deleteClub = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Transaction to safely remove everything
    await prisma.$transaction(async (tx) => {
      // Find club to get admin ID
      const club = await tx.club.findUnique({ where: { id } });
      if (!club) throw new Error("Club not found");

      // Delete Registrations & Events
      // Note: In a real app, you might want to soft-delete or keep archives
      const events = await tx.event.findMany({ where: { clubId: id } });
      const eventIds = events.map(e => e.id);
      
      await tx.registration.deleteMany({ where: { eventId: { in: eventIds } } });
      await tx.event.deleteMany({ where: { clubId: id } });

      // Delete Club
      await tx.club.delete({ where: { id } });

      // Downgrade Admin back to STUDENT
      await tx.user.update({
        where: { id: club.adminId },
        data: { role: "STUDENT" }
      });
    });

    res.json({ message: "Club deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete club" });
  }
};

// --- 6. EXISTING: Update Club ---
exports.updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Simple update
    const updatedClub = await prisma.club.update({
      where: { id },
      data: { name, description }
    });

    res.json(updatedClub);
  } catch (error) {
    res.status(500).json({ error: "Failed to update club" });
  }
};