const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 1. Create Event (Only Club Admins)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const userId = req.user.id; // Comes from authMiddleware

    // Find which club this user manages
    const club = await prisma.club.findUnique({
      where: { adminId: userId },
    });

    if (!club) {
      return res.status(403).json({ error: "You are not an admin of any club." });
    }

    // Create the event linked to that club
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date), // Convert string to Date object
        location,
        clubId: club.id,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create event" });
  }
};

// 2. Get All Events (Public)
exports.getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        club: {
          select: { name: true }, // Include the club name in the result
        },
      },
      orderBy: { date: 'asc' }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
};