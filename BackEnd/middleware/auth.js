const jwt = require("jsonwebtoken");

// Fallback JWT secret if not defined in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_key_12345";

module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }
    // Format: Bearer TOKEN
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    // attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
