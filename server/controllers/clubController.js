const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

exports.createClub = async (req, res) => {
  try {
    const { clubName, clubDescription, adminName, adminEmail, adminPassword } = req.body;

    // Check if club already exists
    const existingClub = await prisma.club.findUnique({
      where: { name: clubName },
    });
    if (existingClub) {
      return res.status(400).json({ error: "Club name already taken" });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    if (existingUser) {
      return res.status(400).json({ error: "User email already exists" });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // *** THE TRANSACTION ***
    // This ensures both operations succeed, or neither does.
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Create the Club Admin User
      const newAdmin = await prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: "CLUB_ADMIN",
        },
      });

      // 2. Create the Club and link it to the Admin
      const newClub = await prisma.club.create({
        data: {
          name: clubName,
          description: clubDescription,
          adminId: newAdmin.id, // Link to the user we just created
        },
      });

      return { newClub, newAdmin };
    });

    res.status(201).json({ 
      message: "Club and Admin created successfully!", 
      club: result.newClub,
      admin: {
          id: result.newAdmin.id,
          name: result.newAdmin.name,
          email: result.newAdmin.email
      }
    });

  } catch (error) {
    console.error("Transaction Error:", error);
    res.status(500).json({ error: "Failed to create club." });
  }
};

// Get All Clubs (For Super Admin or Public Directory)
exports.getAllClubs = async (req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      include: {
        admin: {
          select: { name: true, email: true } // Show us who runs the club
        },
        _count: {
          select: { events: true } // Count how many events they have
        }
      }
    });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
};

// Delete Club (Super Admin Only)
exports.deleteClub = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the club first (to get the adminId)
    const club = await prisma.club.findUnique({
      where: { id },
      include: { events: true }
    });

    if (!club) return res.status(404).json({ error: "Club not found" });

    // 2. Perform Clean-up Transaction
    await prisma.$transaction(async (prisma) => {
      
      // A. Get all event IDs for this club
      const eventIds = club.events.map(e => e.id);

      // B. Delete all registrations for these events
      if (eventIds.length > 0) {
        await prisma.registration.deleteMany({
          where: { eventId: { in: eventIds } }
        });
      }

      // C. Delete all events
      await prisma.event.deleteMany({
        where: { clubId: id }
      });

      // D. Delete the Club
      await prisma.club.delete({
        where: { id }
      });

      // E. Downgrade the Club Admin User back to STUDENT
      await prisma.user.update({
        where: { id: club.adminId },
        data: { role: 'STUDENT' }
      });
    });

    res.json({ message: "Club deleted and Admin downgraded to Student." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete club" });
  }
};