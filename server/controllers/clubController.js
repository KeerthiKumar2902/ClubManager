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
// --- 7. Update Club (Role Protected) ---
exports.updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, adminEmail } = req.body;
    const requestUser = req.user; // From authMiddleware

    // 1. Fetch current club
    const currentClub = await prisma.club.findUnique({ where: { id } });
    if (!currentClub) return res.status(404).json({ error: "Club not found" });

    // 2. Authorization Check & Data Sanitization
    let updateData = {};

    if (requestUser.role === 'CLUB_ADMIN') {
      // CLUB_ADMIN: Can ONLY update description
      // We ignore 'name' and 'adminEmail' even if sent
      updateData = { description }; 
    } else if (requestUser.role === 'SUPER_ADMIN') {
      // SUPER_ADMIN: Can update everything
      updateData = { name, description };
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    // 3. Simple Update (No Ownership Transfer)
    // This runs if it's a Club Admin OR if Super Admin didn't provide an email
    if (!adminEmail || requestUser.role === 'CLUB_ADMIN') {
      const updatedClub = await prisma.club.update({
        where: { id },
        data: updateData
      });
      return res.json(updatedClub);
    }

    // 4. Complex Update (Ownership Transfer - SUPER ADMIN ONLY)
    // Code below only runs for SUPER_ADMIN with adminEmail provided
    
    const newUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!newUser) return res.status(404).json({ error: "New admin email not found" });

    if (newUser.id === currentClub.adminId) {
       const updatedClub = await prisma.club.update({ where: { id }, data: updateData });
       return res.json(updatedClub);
    }

    if (newUser.role === 'CLUB_ADMIN') {
      return res.status(400).json({ error: "Target user is already a Club Admin." });
    }

    // Transaction: Swap Roles
    const result = await prisma.$transaction(async (tx) => {
      if (currentClub.adminId) {
        await tx.user.update({ where: { id: currentClub.adminId }, data: { role: 'STUDENT' } });
      }
      await tx.user.update({ where: { id: newUser.id }, data: { role: 'CLUB_ADMIN' } });

      const updated = await tx.club.update({
        where: { id },
        data: { ...updateData, adminId: newUser.id },
        include: { admin: { select: { name: true, email: true } } }
      });
      return updated;
    });

    res.json(result);

  } catch (error) {
    console.error("Update Error:", error);
    if (error.code === 'P2002') return res.status(400).json({ error: "Club name taken" });
    res.status(500).json({ error: "Failed to update club" });
  }
};

// --- 8. Join a Club (Student Action) ---
exports.joinClub = async (req, res) => {
  try {
    const userId = req.user.id;
    const clubId = req.params.id;

    // 1. Check if Club exists
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) return res.status(404).json({ error: "Club not found" });

    // 2. Check if already a member
    const existing = await prisma.membership.findUnique({
      where: {
        studentId_clubId: {
          studentId: userId,
          clubId: clubId
        }
      }
    });

    if (existing) return res.status(400).json({ error: "You are already a member!" });

    // 3. Create Membership
    await prisma.membership.create({
      data: {
        studentId: userId,
        clubId: clubId
      }
    });

    res.json({ message: "Welcome to the club! 🎉" });

  } catch (error) {
    console.error("Join Error:", error);
    res.status(500).json({ error: "Failed to join club" });
  }
};

// --- 9. Leave a Club (Student Action) ---
exports.leaveClub = async (req, res) => {
  try {
    const userId = req.user.id;
    const clubId = req.params.id;

    // Delete membership if it exists
    await prisma.membership.delete({
      where: {
        studentId_clubId: {
          studentId: userId,
          clubId: clubId
        }
      }
    });

    res.json({ message: "You have left the club." });

  } catch (error) {
    // P2025 is Prisma's "Record not found" code
    if (error.code === 'P2025') return res.status(400).json({ error: "Not a member" });
    res.status(500).json({ error: "Failed to leave club" });
  }
};

// --- 10. Get Public Club Profile (Directory View) ---
exports.getClubProfile = async (req, res) => {
  try {
    const clubId = req.params.id;

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        admin: { select: { name: true, email: true } }, // Show who runs it
        events: {
          where: { date: { gte: new Date() } }, // Only show UPCOMING events
          orderBy: { date: 'asc' }
        },
        _count: {
          select: { members: true } // Show "500 Members" count
        }
      }
    });

    if (!club) return res.status(404).json({ error: "Club not found" });

    res.json(club);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch club profile" });
  }
};

// --- 11. Get Club Members (Admin Dashboard View) ---
exports.getClubMembers = async (req, res) => {
  try {
    const clubId = req.params.id;
    const userId = req.user.id;

    // Security: Only the Admin of THIS club can see the member list
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) return res.status(404).json({ error: "Club not found" });

    if (club.adminId !== userId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Not authorized to view member list" });
    }

    const members = await prisma.membership.findMany({
      where: { clubId },
      include: {
        student: { select: { id: true, name: true, email: true } }
      },
      orderBy: { joinedAt: 'desc' }
    });

    res.json(members);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
};

// --- 12. Get My Memberships (Student) ---
exports.getMyMemberships = async (req, res) => {
  try {
    const userId = req.user.id;

    const memberships = await prisma.membership.findMany({
      where: { studentId: userId },
      include: {
        club: {
          include: {
            _count: { select: { members: true } }
          }
        }
      }
    });

    // Transform data to return just the club details with join date
    const myClubs = memberships.map(m => ({
      ...m.club,
      joinedAt: m.joinedAt
    }));

    res.json(myClubs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch memberships" });
  }
};

// --- 13. Remove Member (Club Admin Action) ---
exports.removeMember = async (req, res) => {
  try {
    // 'id' is the clubId (from router /:id), 'studentId' is the member to remove
    const { id: clubId, studentId } = req.params;
    const requesterId = req.user.id;

    // 1. Verify Club Ownership
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) return res.status(404).json({ error: "Club not found" });

    // Only the Club Admin (or Super Admin) can remove people
    if (club.adminId !== requesterId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Not authorized to remove members" });
    }

    // 2. Delete the Membership
    await prisma.membership.delete({
      where: {
        studentId_clubId: {
          studentId: studentId,
          clubId: clubId
        }
      }
    });

    res.json({ message: "Member removed successfully" });

  } catch (error) {
    console.error("Remove Member Error:", error);
    // P2025 is Prisma's "Record not found" code
    if (error.code === 'P2025') return res.status(404).json({ error: "Membership not found" });
    res.status(500).json({ error: "Failed to remove member" });
  }
};