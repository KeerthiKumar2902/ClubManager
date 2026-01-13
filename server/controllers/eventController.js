const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 1. Create Event (Only Club Admins)
exports.createEvent = async (req, res) => {
  try {
    // 1. Get capacity from body (default to 50 if missing)
    const { title, description, date, location, capacity } = req.body; 
    const userId = req.user.id;

    const club = await prisma.club.findUnique({
      where: { adminId: userId },
    });

    if (!club) return res.status(403).json({ error: "Not authorized" });

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        capacity: parseInt(capacity) || 50, // <--- Add this
        clubId: club.id,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  }
};

// 2. Get All Events (Public) - UPDATED
exports.getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        club: {
          select: { name: true },
        },
        // --- ADD THIS BLOCK ---
        _count: {
          select: { registrations: true }
        }
        // ----------------------
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

    const club = await prisma.club.findUnique({
      where: { adminId: userId },
    });

    if (!club) {
      return res.status(404).json({ error: "You do not manage a club." });
    }

    // UPDATE: Include the count of registrations
    const events = await prisma.event.findMany({
      where: { clubId: club.id },
      include: {
        _count: {
          select: { registrations: true } // <--- Counts the attendees
        }
      },
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
    const userId = req.user.id;
    const eventId = req.params.id;

    // 1. Fetch Event + Count current registrations
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { 
        _count: { 
          select: { registrations: true } 
        } 
      }
    });

    if (!event) return res.status(404).json({ error: "Event not found" });

    // 2. CHECK: Time Travel
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ error: "This event has already ended." });
    }

    // 3. CHECK: Capacity Limit (NEW CODE)
    if (event._count.registrations >= event.capacity) {
      return res.status(400).json({ error: "Housefull! No seats available." });
    }

    // 4. Check if already registered
    const existing = await prisma.registration.findUnique({
      where: { studentId_eventId: { studentId: userId, eventId: eventId } }
    });

    if (existing) return res.status(400).json({ error: "You are already registered." });

    // 5. Create Registration
    const registration = await prisma.registration.create({
      data: { studentId: userId, eventId: eventId }
    });

    res.status(201).json({ message: "Registered!", registration });

  } catch (error) {
    res.status(500).json({ error: "Registration failed." });
  }
};

// 5. Get My Registrations (For Students)
exports.getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;

    const registrations = await prisma.registration.findMany({
      where: { studentId: userId },
      include: {
        event: {
          include: { club: true } // Get Event details AND Club name
        }
      },
      orderBy: { registeredAt: 'desc' }
    });

    res.json(registrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
};

// 6. Get Attendees for a specific Event (Club Admin only)
exports.getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Security Check: Does this event belong to the admin's club?
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { club: true }
    });

    if (!event) return res.status(404).json({ error: "Event not found" });

    // In a real app, we would check if event.club.adminId === userId
    // For now, we assume if you are a CLUB_ADMIN, you can view (or we trust the frontend)
    // But let's be safe:
    if (event.club.adminId !== userId) {
      return res.status(403).json({ error: "You do not own this event" });
    }

    // Fetch Registrations with Student Details
    const attendees = await prisma.registration.findMany({
      where: { eventId },
      include: {
        student: {
          select: { id: true, name: true, email: true } // Only get safe data
        }
      }
    });

    res.json(attendees);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch attendees" });
  }
};

// 7. Mark Attendance (Club Admin Only)
exports.markAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { studentId, status } = req.body; // status = true/false
    const userId = req.user.id;

    // 1. Verify Ownership (Security)
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { club: true }
    });

    if (!event || event.club.adminId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // 2. Update the Registration
    const updatedRegistration = await prisma.registration.update({
      where: {
        studentId_eventId: {
          studentId: studentId,
          eventId: eventId
        }
      },
      data: { attended: status }
    });

    res.json(updatedRegistration);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update attendance" });
  }
};

// 8. Cancel Registration (Student Only)
exports.cancelRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    // Delete the specific registration row
    const deleted = await prisma.registration.delete({
      where: {
        studentId_eventId: {
          studentId: userId,
          eventId: eventId
        }
      }
    });

    res.json({ message: "Registration cancelled", deleted });

  } catch (error) {
    console.error(error);
    // If record not found (P2025 is Prisma error code for 'Record not found')
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Registration not found" });
    }
    res.status(500).json({ error: "Failed to cancel registration" });
  }
};

// 9. Delete Event (Club Admin Only)
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params; // Event ID from URL
    const userId = req.user.id;

    // 1. Check Ownership
    const event = await prisma.event.findUnique({
      where: { id },
      include: { club: true }
    });

    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.club.adminId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this event" });
    }

    // 2. Transaction: Delete Registrations FIRST, then the Event
    await prisma.$transaction([
      prisma.registration.deleteMany({ where: { eventId: id } }),
      prisma.event.delete({ where: { id } })
    ]);

    res.json({ message: "Event deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

// 10. Update Event (Club Admin Only)
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, capacity } = req.body;
    const userId = req.user.id;

    // 1. Check Ownership
    const event = await prisma.event.findUnique({
      where: { id },
      include: { club: true }
    });

    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.club.adminId !== userId) {
      return res.status(403).json({ error: "Not authorized to update this event" });
    }

    // 2. Update Event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date: new Date(date),
        location,
        capacity: parseInt(capacity)
      }
    });

    res.json(updatedEvent);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update event" });
  }
};