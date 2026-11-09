const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jwtSecret, jwtExpiresIn } = require("../config/env");

const createError = (status, message, code) =>
  Object.assign(new Error(message), { status, code });

async function register({ username, email, password }) {
  if (!username || !email || !password) {
    throw createError(400, "Explorer name, email, and password are required", "VALIDATION_ERROR");
  }

  const trimmedUsername = username.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (trimmedUsername.length < 3) {
    throw createError(400, "Explorer name must be at least 3 characters", "INVALID_USERNAME");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    throw createError(400, "Please provide a valid email address", "INVALID_EMAIL");
  }

  if (password.length < 6) {
    throw createError(400, "Password must be at least 6 characters long", "INVALID_PASSWORD");
  }

  // Check if email already exists
  const existingEmail = await User.findOne({ email: trimmedEmail });
  if (existingEmail) {
    throw createError(409, "An explorer with this email already exists", "EMAIL_EXISTS");
  }

  // Check if username already exists
  const existingUsername = await User.findOne({ username: trimmedUsername });
  if (existingUsername) {
    throw createError(409, "Explorer name is already taken", "USERNAME_EXISTS");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    username: trimmedUsername,
    email: trimmedEmail,
    passwordHash,
  });

  const token = jwt.sign(
    { id: user._id, username: user.username },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  const userDoc = user.toObject();
  delete userDoc.passwordHash;

  return { user: userDoc, token };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw createError(400, "Email and password are required", "VALIDATION_ERROR");
  }

  const trimmedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: trimmedEmail }).select("+passwordHash");
  if (!user) {
    throw createError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw createError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  const userDoc = user.toObject();
  delete userDoc.passwordHash;

  return { user: userDoc, token };
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw createError(404, "User not found", "USER_NOT_FOUND");
  }
  return user;
}

module.exports = { register, login, getMe };

