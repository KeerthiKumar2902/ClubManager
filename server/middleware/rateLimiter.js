const rateLimit = require("express-rate-limit");

// General Limiter (for most routes)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

// Strict Limiter (for Login/Register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: "Too many login attempts, please try again after 15 minutes."
});

module.exports = { generalLimiter, authLimiter };