const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow Frontend to talk to Backend
app.use(express.json()); // Parse incoming JSON data

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Server is running! Database is connected.");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});