const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// --- 1. Get All Clubs (Public) ---
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

// --- 2. Student Requests a Club ---
exports.requestClub = async (req, res) => {
  try {
    const { name, description } = req.body;
    const studentId = req.user.id;

    // A. Check if club name exists
    const existingClub = await prisma.club.findUnique({ where: { name } });
    if (existingClub) return res.status(400).json({ error: "Club name already taken" });

    // B. Check if user already has a pending request
    const existingRequest = await prisma.clubRequest.findFirst({
      where: { studentId, status: "PENDING" }
    });
    if (existingRequest) return res.status(400).json({ error: "You already have a pending request." });

    // C. Check if user is ALREADY a Club Admin
    const user = await prisma.user.findUnique({ where: { id: studentId } });
    if (user.role === 'CLUB_ADMIN') return res.status(400).json({ error: "You are already leading a club!" });

    const request = await prisma.clubRequest.create({
      data: { name, description, studentId }
    });

    res.status(201).json({ message: "Request submitted!", request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit request" });
  }
};

// --- 3. Admin Views Pending Requests (FIXED) ---
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await prisma.clubRequest.findMany({
      where: { status: 'PENDING' }, // <--- FIX: Only show pending!
      include: {
        student: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// --- 4. Admin Approves/Rejects Request ---
exports.processClubRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; 

    const request = await prisma.clubRequest.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ error: "Request not found" });

    // REJECT
    if (status === "REJECTED") {
      await prisma.clubRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" }
      });
      return res.json({ message: "Request rejected." });
    }

    // APPROVE (Transaction)
    await prisma.$transaction(async (tx) => {
      // 1. Create Club
      await tx.club.create({
        data: {
          name: request.name,
          description: request.description,
          adminId: request.studentId
        }
      });

      // 2. Promote User
      await tx.user.update({
        where: { id: request.studentId },
        data: { role: "CLUB_ADMIN" }
      });

      // 3. Close Request
      await tx.clubRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" }
      });
    });

    res.json({ message: "Club approved successfully!" });
  } catch (error) {
    console.error("Process Error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
};

// --- 5. Manual Club Creation (Super Admin Override) ---
exports.createClub = async (req, res) => {
  try {
    const { name, description, adminEmail } = req.body;

    // 1. Find User by Email
    const user = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!user) {
      return res.status(404).json({ error: "User with this email not found. Ask them to register first." });
    }
    
    if (user.role === 'CLUB_ADMIN') {
      return res.status(400).json({ error: "This user is ALREADY a Club Admin." });
    }

    // 2. Create Club & Promote User
    await prisma.$transaction(async (tx) => {
      await tx.club.create({
        data: {
          name, 
          description, 
          adminId: user.id
        }
      });

      await tx.user.update({
        where: { id: user.id },
        data: { role: "CLUB_ADMIN" }
      });
    });

    res.status(201).json({ message: "Club created manually!" });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
       return res.status(400).json({ error: "Club name taken" });
    }
    res.status(500).json({ error: "Failed to create club" });
  }
};

// --- 6. Delete Club ---
exports.deleteClub = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.$transaction(async (tx) => {
      const club = await tx.club.findUnique({ where: { id } });
      if (!club) throw new Error("Club not found");

      // Cleanup
      const events = await tx.event.findMany({ where: { clubId: id } });
      const eventIds = events.map(e => e.id);
      await tx.registration.deleteMany({ where: { eventId: { in: eventIds } } });
      await tx.event.deleteMany({ where: { clubId: id } });

      // Delete Club
      await tx.club.delete({ where: { id } });

      // Downgrade Admin
      await tx.user.update({
        where: { id: club.adminId },
        data: { role: "STUDENT" }
      });
    });

    res.json({ message: "Club deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete club" });
  }
};

// --- 7. Update Club (With Ownership Transfer) ---
exports.updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, adminEmail } = req.body;

    // 1. Fetch current club to check who the current admin is
    const currentClub = await prisma.club.findUnique({ where: { id } });
    if (!currentClub) return res.status(404).json({ error: "Club not found" });

    // 2. If no admin transfer is requested, just update details
    if (!adminEmail) {
      const updatedClub = await prisma.club.update({
        where: { id },
        data: { name, description }
      });
      return res.json(updatedClub);
    }

    // 3. Handle Ownership Transfer
    const newUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!newUser) return res.status(404).json({ error: "New admin email not found" });

    // If the email provided is SAME as current admin, just update details
    if (newUser.id === currentClub.adminId) {
       const updatedClub = await prisma.club.update({
        where: { id },
        data: { name, description }
      });
      return res.json(updatedClub);
    }

    // Check if new user is busy (Already an admin of another club)
    if (newUser.role === 'CLUB_ADMIN') {
      return res.status(400).json({ error: "Target user is already a Club Admin of another club." });
    }

    // --- TRANSACTION: SWAP ROLES ---
    const result = await prisma.$transaction(async (tx) => {
      // A. Downgrade Old Admin to STUDENT
      if (currentClub.adminId) {
        await tx.user.update({
          where: { id: currentClub.adminId },
          data: { role: 'STUDENT' }
        });
      }

      // B. Promote New User to CLUB_ADMIN
      await tx.user.update({
        where: { id: newUser.id },
        data: { role: 'CLUB_ADMIN' }
      });

      // C. Update Club Details & Link to New Admin
      const updated = await tx.club.update({
        where: { id },
        data: { 
          name, 
          description, 
          adminId: newUser.id 
        },
        include: { admin: { select: { name: true, email: true } } } // Return new admin info
      });

      return updated;
    });

    res.json(result);

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update club" });
  }
  
};

