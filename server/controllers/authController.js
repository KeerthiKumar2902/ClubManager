const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 2. Hash the password (Security Best Practice)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save to Database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "STUDENT", // Default to Student if no role sent
      },
    });

    res.status(201).json({ message: "User registered successfully!", user });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};