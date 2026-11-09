const Achievement = require("../models/Achievement");
const Progress = require("../models/Progress");
const Mission = require("../models/Mission");
const User = require("../models/User");
const catalogue = require("../data/achievements");

async function seedAchievements() {
  await Achievement.bulkWrite(catalogue.map(({ _id, ...fields }) => ({
    updateOne: { filter: { _id }, update: { $set: fields }, upsert: true },
  })));
}

function summarizeProgress(missions, records) {
  const remaining = new Map();
  const known = new Map(missions.map(mission => [String(mission._id), String(mission.island)]));
  for (const island of known.values()) remaining.set(island, (remaining.get(island) ?? 0) + 1);
  const completed = new Set(), islands = new Set(), days = new Set();
  let flawless = 0;
  for (const record of records) {
    const id = String(record.mission);
    const island = known.get(id);
    if (!island || completed.has(id)) continue;
    completed.add(id);
    islands.add(island);
    remaining.set(island, remaining.get(island) - 1);
    if (record.flawless === true) flawless++;
    if (record.completedAt instanceof Date && Number.isFinite(record.completedAt.getTime())) {
      days.add(record.completedAt.toISOString().slice(0, 10));
    }
  }
  return { missions: completed.size, visitedIslands: islands.size, flawless, days: days.size,
    clearedIslands: [...remaining.values()].filter(count => count === 0).length };
}

async function readStats(userId, session = null) {
  const missions = await Mission.find().select("island").session(session).lean();
  const records = await Progress.find({ user: userId, status: "completed" })
    .select("mission completedAt flawless").session(session).lean();
  return summarizeProgress(missions, records);
}

function publicAchievement(item, earned, stats) {
  const unlocked = Boolean(earned);
  const status = unlocked ? "unlocked" : !item.unavailable && stats[item.rule.metric] > 0 ? "in-progress" : "locked";
  const common = { category: item.category, unlocked, available: !item.unavailable };
  if (item.category === "hidden" && !unlocked) {
    return { ...common, key: "sealed-" + item._id.slice(-2), name: "Sealed Achievement", status: "locked" };
  }
  return { ...common, key: item.key, name: item.name, description: item.description, condition: item.condition,
    icon: item.icon, status, reward: earned?.reward ?? item.reward, unlockedAt: earned?.unlockedAt,
    unavailable: item.unavailable,
    progress: item.rule.metric ? { current: unlocked ? item.rule.threshold : Math.min(stats[item.rule.metric] ?? 0, item.rule.threshold), target: item.rule.threshold } : null };
}

async function unlockEligible(userId, stats, session = null, Users = User) {
  const unlocked = [];
  for (const item of catalogue) {
    if (item.unavailable || !(stats[item.rule.metric] >= item.rule.threshold)) continue;
    const entry = { achievement: item._id, unlockedAt: new Date(), reward: item.reward };
    // The condition and the ledger/coin update are atomic on the same player document.
    const result = await Users.updateOne({ _id: userId, "achievements.achievement": { $ne: item._id } }, {
      $push: { achievements: entry },
      ...(item.reward.coins ? { $inc: { coins: item.reward.coins } } : {}),
    }, { session });
    if (result.modifiedCount === 1) unlocked.push(publicAchievement(item, entry, stats));
  }
  return unlocked;
}

async function afterCompletion(userId, session) {
  return unlockEligible(userId, await readStats(userId, session), session);
}

async function listAchievements(userId, stats) {
  stats ??= await readStats(userId);
  // Reconcile historical completions against the same one-time reward guard.
  await unlockEligible(userId, stats);
  const user = await User.findById(userId).select("achievements coins").lean();
  const earned = new Map((user.achievements ?? []).map(entry => [String(entry.achievement), entry]));
  const items = catalogue.map(item => publicAchievement(item, earned.get(item._id), stats));
  const unlocked = items.filter(item => item.unlocked);
  return { items, balance: user.coins, summary: {
    unlocked: unlocked.length, total: items.length, available: items.filter(item => item.available).length,
    percent: Math.round(100 * unlocked.length / items.length),
    coinsEarned: catalogue.reduce((sum, item) => sum + (earned.get(item._id)?.reward?.coins ?? 0), 0),
    titles: unlocked.flatMap(item => item.reward.title ? [item.reward.title] : []),
  } };
}

module.exports = { seedAchievements, summarizeProgress, publicAchievement, unlockEligible, afterCompletion, listAchievements };
