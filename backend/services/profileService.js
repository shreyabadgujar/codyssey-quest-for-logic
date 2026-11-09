const Island = require("../models/Island");
const Mission = require("../models/Mission");
const Progress = require("../models/Progress");
const ShopItem = require("../models/ShopItem");
const User = require("../models/User");
const { listAchievements, summarizeProgress } = require("./achievementService");

const newest = (a, b) => new Date(b.at) - new Date(a.at) || a.id.localeCompare(b.id);
const validDate = date => date instanceof Date && Number.isFinite(date.getTime());

function buildJournal({ player, islands, missions, progress, badges, shopItems }) {
  const missionById = new Map(missions.map(mission => [String(mission._id), mission]));
  const ownedIds = new Set((player.inventory ?? []).map(String));
  const itemById = new Map(shopItems.filter(item => ownedIds.has(String(item._id))).map(item => [String(item._id), {
    id: String(item._id), name: item.name, slot: item.slot, visual: item.visual, asset: item.asset,
  }]));
  const seen = new Set();
  const completed = progress.filter(record => {
    const id = String(record.mission);
    if (seen.has(id) || !missionById.has(id)) return false;
    seen.add(id);
    return true;
  });
  const expeditions = islands.map(island => {
    const id = String(island._id);
    const published = missions.filter(mission => String(mission.island) === id);
    return { slug: island.slug, name: island.name, topic: island.topic,
      total: published.length, completed: published.filter(mission => seen.has(String(mission._id))).length };
  });
  const earned = badges.items.filter(item => item.unlocked).sort((a, b) =>
    (Date.parse(b.unlockedAt) || 0) - (Date.parse(a.unlockedAt) || 0) || a.key.localeCompare(b.key));
  const cosmetics = Object.entries(player.avatar?.equipped ?? {}).flatMap(([slot, id]) => {
    const item = itemById.get(String(id));
    return item?.slot === slot ? [item] : [];
  });
  const purchases = (player.inventoryPurchases ?? []).flatMap(entry => {
    const item = itemById.get(String(entry.item));
    return item && validDate(entry.purchasedAt) ? [{ ...item, at: entry.purchasedAt }] : [];
  }).sort(newest);
  const activity = [
    ...completed.filter(record => validDate(record.completedAt)).map(record => {
      const mission = missionById.get(String(record.mission));
      return { id: "mission-" + mission._id, kind: "mission", name: mission.title,
        at: record.completedAt, href: "/missions/" + mission._id };
    }),
    ...earned.filter(item => validDate(item.unlockedAt)).map(item => ({
      id: "achievement-" + item.key, kind: "achievement", name: item.name, at: item.unlockedAt, href: "/achievements",
    })),
    ...purchases.map(item => ({
      id: "purchase-" + item.id, kind: "purchase", name: item.name, at: item.at, href: "/shop",
    })),
  ].sort(newest).slice(0, 8);

  return {
    player,
    stats: { missionsCompleted: completed.length, islandsExplored: expeditions.filter(island => island.completed > 0).length,
      islandCount: expeditions.length, achievementsUnlocked: badges.summary.unlocked },
    expeditions,
    achievements: { recent: earned.slice(0, 4), titles: badges.summary.titles,
      inProgress: badges.items.filter(item => item.status === "in-progress" && item.progress).slice(0, 3) },
    inventory: { count: ownedIds.size, equipped: cosmetics, recent: purchases.slice(0, 4),
      ownedPreview: [...itemById.values()].slice(0, 4) },
    activity,
  };
}

async function getProfileJournal(userId) {
  const [islands, missions, progress] = await Promise.all([
    Island.find().sort({ order: 1 }).select("slug name topic").lean(),
    Mission.find().select("island title").lean(),
    Progress.find({ user: userId, status: "completed" }).select("mission completedAt flawless").lean(),
  ]);
  const badges = await listAchievements(userId, summarizeProgress(missions, progress));
  const player = await User.findById(userId).select("-passwordHash").lean();
  if (!player) throw Object.assign(new Error("Explorer account not found."), { status: 404, code: "USER_NOT_FOUND" });
  const shopItems = await ShopItem.find({ _id: { $in: player.inventory ?? [] } }).select("name slot visual asset").lean();
  return buildJournal({ player, islands, missions, progress, badges, shopItems });
}

module.exports = { getProfileJournal, buildJournal };
