const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const result = await authService.register({ username, email, password });
  res.status(201).json({ data: result });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  res.json({ data: result });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  res.json({ data: user });
});
