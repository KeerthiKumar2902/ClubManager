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

// 3. Get Events for the Logged-in Admin's Club
exports.getMyClubEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Find the club this user manages
    const club = await prisma.club.findUnique({
      where: { adminId: userId },
    });

    if (!club) {
      return res.status(404).json({ error: "You do not manage a club." });
    }

    // 2. Fetch events for this club
    const events = await prisma.event.findMany({
      where: { clubId: club.id },
      orderBy: { date: 'desc' }
    });

    res.json(events);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch club events" });
  }
};

// 4. Register User for an Event
exports.registerForEvent = async (req, res) => {
  try {
    const userId = req.user.id;      // From Token
    const eventId = req.params.id;   // From URL (e.g., /api/events/123/register)

    // 1. Check if already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        studentId_eventId: {
          studentId: userId,
          eventId: eventId
        }
      }
    });

    if (existingRegistration) {
      return res.status(400).json({ error: "You are already registered for this event." });
    }

    // 2. Create Registration
    const registration = await prisma.registration.create({
      data: {
        studentId: userId,
        eventId: eventId
      }
    });

    res.status(201).json({ message: "Successfully registered!", registration });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed." });
  }
};