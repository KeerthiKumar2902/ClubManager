const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // 1. Get the token from the header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Remove "Bearer " prefix

  try {
    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach user info to the request object
    req.user = decoded; 
    
    next(); // Move to the next function (the controller)
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authMiddleware;