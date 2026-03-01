const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const clubRoutes = require("./routes/clubRoutes");
const eventRoutes = require("./routes/eventRoutes");
const passport = require("passport");
require("./config/passport");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
); // Allow Frontend to talk to Backend
app.use(express.json()); // Parse incoming JSON data

app.set("trust proxy", 1);// Trust reverse proxy (if using Heroku or similar) for secure cookies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/events", eventRoutes);
app.use(passport.initialize());
app.get("/", (req, res) => {
  res.send("🚀 Server is running! Database is connected.");
});

// Start Server
// Start Server
// Adding "0.0.0.0" forces it to open the port to Render's cloud network
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});