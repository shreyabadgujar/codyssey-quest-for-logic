const notImplemented = require("../utils/notImplemented");
const asyncHandler = require("../utils/asyncHandler");
const { equipAvatar, equipItem } = require("../services/avatarService");
const { getProfileJournal } = require("../services/profileService");
exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ data: req.query.view === "journal" ? await getProfileJournal(req.user._id) : req.user });
});
exports.updateAvatar = asyncHandler(async (req, res) => {
  const update = req.body && Object.hasOwn(req.body, "slot") ? equipItem : equipAvatar;
  res.json({ data: await update(req.user._id, req.body) });
});
exports.claimStreak = notImplemented("Streak claim");
