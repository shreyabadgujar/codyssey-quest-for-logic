const asyncHandler = require("../utils/asyncHandler");
const { listAchievements } = require("../services/achievementService");
exports.list = asyncHandler(async (req, res) => {
  res.json({ data: await listAchievements(req.user._id) });
});
