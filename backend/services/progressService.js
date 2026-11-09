const Mission = require("../models/Mission");
const Progress = require("../models/Progress");
async function assertUnlocked(user, mission) {
  if (mission.level === 1) return;
  const previous = await Mission.findOne({ island: mission.island, level: mission.level - 1 }).select("_id").lean();
  if (!previous || !await Progress.exists({ user, mission: previous._id, status: "completed" })) {
    throw Object.assign(new Error("Complete the previous mission on this island first"), { status: 403, code: "MISSION_LOCKED" });
  }
}
async function recordIncorrectSubmission(user, mission) {
  await Progress.updateOne({ user, mission: mission._id }, {
    $inc: { incorrectSubmissions: 1 },
    $setOnInsert: { island: mission.island, status: "in_progress" },
  }, { upsert: true });
}
module.exports = { assertUnlocked, recordIncorrectSubmission };
