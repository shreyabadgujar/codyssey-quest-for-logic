const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: { message: "Authorization required", code: "UNAUTHORIZED" } });
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: { message: "User not found", code: "UNAUTHORIZED" } });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: { message: "Invalid or expired token", code: "INVALID_TOKEN" } });
  }
};
