const mongoose = require("mongoose");
const Progress = require("../models/Progress");
const User = require("../models/User");
const SubmissionLease = require("../models/SubmissionLease");
const { afterCompletion } = require("./achievementService");
const { count: countPuzzleMissions } = require("./puzzleService");
const { milestoneReached } = require("./puzzleSelectionService");
function createRewardService({ connection = mongoose.connection, ProgressModel = Progress,
  UserModel = User, LeaseModel = SubmissionLease, unlock = afterCompletion, puzzleCount } = {}) {
  return async function grantCompletion(user, mission, language, owner) {
    if (![mission.xpReward, mission.coinReward].every((value) => Number.isSafeInteger(value) && value >= 0)) throw new Error("Invalid mission reward");
    // Atlas transactions make completion and balance changes all-or-nothing.
    return connection.transaction(async (session) => {
      const lease = await LeaseModel.updateOne({ _id: user, owner, expiresAt: { $gt: new Date() } },
        { $set: { expiresAt: new Date(Date.now() + 600000) } }, { session });
      if (lease.matchedCount !== 1) throw new Error("Submission lease expired");
      const existing = await ProgressModel.findOne({ user, mission: mission._id }).session(session);
      if (existing?.rewardsGranted) return { xp: 0, coins: 0, firstCompletion: false };
      await ProgressModel.updateOne({ user, mission: mission._id }, {
        $set: { island: mission.island, status: "completed", completedAt: new Date(), rewardsGranted: true,
          languageUsed: language, flawless: (existing?.incorrectSubmissions ?? 0) === 0 },
        $inc: { attempts: 1 },
      }, { upsert: true, session });
      const updated = await UserModel.updateOne({ _id: user }, { $inc: { xp: mission.xpReward, coins: mission.coinReward } }, { session });
      if (updated.matchedCount !== 1) throw new Error("User no longer exists");
      const achievements = await unlock(user, session);
      const completed = puzzleCount ? await puzzleCount(user, session) : 0;
      return { xp: mission.xpReward, coins: mission.coinReward, firstCompletion: true, achievements,
        ...(milestoneReached(completed) ? { puzzleMilestone: completed } : {}) };
    });
  };
}
module.exports = { grantCompletion: createRewardService({ puzzleCount: countPuzzleMissions }), createRewardService };
