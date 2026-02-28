const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto"); // Built-in Node module for generating tokens
const sendEmail = require("../utils/emailService");
const cloudinary = require("../utils/cloudinary");

const prisma = new PrismaClient();

// --- REGISTER ---
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Generate Random Verification Token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // 2. Create User (isVerified = false by default in schema)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "STUDENT",
        verificationToken: verificationToken, 
        isVerified: false, 
      },
    });

    // 3. Send Verification Email
    // Note: In production, change http://localhost:5173 to your actual frontend URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    
    const message = `
      <h1>Welcome to Club Manager!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}" clicktracking=off>${verifyUrl}</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Verify your email",
        html: message,
      });
      
      res.status(201).json({ 
        message: "Registration successful! Please check your email to verify account." 
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      // Uncomment the deletion logic!
      await prisma.user.delete({ where: { email: user.email } });
      return res.status(500).json({ error: "Registration failed. Please try again." });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// --- LOGIN ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 1. Check Verification Status
    if (!user.isVerified) {
      return res.status(401).json({ error: "Please verify your email first!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET,           
      { expiresIn: "1d" }               
    );

    res.status(200).json({ message: "Login successful", token, user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

// --- VERIFY EMAIL ---
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body; // Or req.params if you prefer GET request

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null, // Clear the token
      },
    });

    res.status(200).json({ message: "Email verified successfully! You can now login." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Verification failed" });
  }
};

// --- FORGOT PASSWORD ---
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 1. Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 Hour from now

    // 2. Save to DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires,
      },
    });

    // 3. Send Email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    const message = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password. Valid for 1 hour.</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
    `;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      html: message,
    });

    res.status(200).json({ message: "Password reset link sent to email." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send reset email" });
  }
};

// --- RESET PASSWORD ---
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 1. Find user with this token AND make sure time hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() }, // gt = Greater Than now
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update User & Clear Tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.status(200).json({ message: "Password reset successful! Please login." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};


// --- UPDATE PROFILE 
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { name, password, currentPassword } = req.body;
    let avatarUrl = null;

    // 1. Handle Image Upload (If a file was sent)
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "club_manager/profiles",
          width: 300, 
          crop: "scale" 
        });
        avatarUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Error:", uploadError);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    // 2. Fetch Current User
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const updateData = {};
    if (name) updateData.name = name;
    if (avatarUrl) updateData.avatar = avatarUrl; // Update avatar if new one uploaded

    // 3. Handle Password Change (Existing Logic)
    if (password) {
      if (!currentPassword) return res.status(400).json({ error: "Current password required." });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(401).json({ error: "Incorrect current password." });
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 4. Update Database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, avatar: true } // Include avatar in response
    });

    res.json({ message: "Profile updated!", user: updatedUser });

  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};