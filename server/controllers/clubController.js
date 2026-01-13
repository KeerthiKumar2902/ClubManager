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