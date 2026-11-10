const { test } = require("node:test");
const assert = require("node:assert/strict");
const { buildJournal } = require("../services/profileService");

const before = new Date("2026-11-08T00:00Z");
const after = new Date("2026-11-09T00:00Z");
const islands = [{ _id: "a", slug: "array", name: "Array", topic: "Arrays" }, { _id: "b", slug: "tree", name: "Tree" }];
const missions = [{ _id: "m1", island: "a", title: "First case" }, { _id: "m2", island: "a", title: "Second case" }];
const badges = { items: [], summary: { unlocked: 0, titles: [] } };

test("a fresh explorer has zero stats, no events, and the real island mission totals", () => {
  const journal = buildJournal({ player: { xp: 0, coins: 0 }, islands, missions, progress: [], badges, shopItems: [] });
  assert.deepEqual(journal.stats, { missionsCompleted: 0, puzzlesSolved: 0, islandsExplored: 0, islandCount: 2, achievementsUnlocked: 0 });
  assert.deepEqual(journal.expeditions.map(({ completed, total }) => [completed, total]), [[0, 2], [0, 0]]);
  assert.deepEqual(journal.activity, []);
  assert.equal(journal.inventory.count, 0);
});

test("journal merges real event dates and preserves undated legacy ownership without inventing activity", () => {
  const journal = buildJournal({
    player: { xp: 50, coins: 30, inventory: ["pin", "legacy", "fox", "silver", "gold"], avatar: { equipped: { pin: "pin", frame: "unowned" } },
      inventoryPurchases: [{ item: "pin", purchasedAt: after }, { item: "unowned", purchasedAt: after }] },
    islands, missions,
    progress: [{ mission: "m1", completedAt: before }, { mission: "m1", completedAt: after }, { mission: "unknown", completedAt: before }],
    badges: { items: [
      { key: "first", name: "First Expedition", unlocked: true, unlockedAt: before },
      { key: "sealed", name: "Sealed Achievement", status: "locked" },
    ], summary: { unlocked: 1, titles: [] } },
    shopItems: [{ _id: "pin", slot: "pin", name: "Compass Pin" }, { _id: "legacy", slot: "background", name: "Legacy background" },
      { _id: "fox", slot: "companion", name: "Explorer Fox" }, { _id: "silver", slot: "frame", name: "Silver Explorer Frame" },
      { _id: "gold", slot: "frame", name: "Antique Gold Frame" },
      { _id: "unowned", slot: "frame", name: "Private frame" }],
    solvedPuzzles: [{ _id: "p1", puzzleId: "island-messenger" }],
  });
  assert.deepEqual(journal.stats, { missionsCompleted: 1, puzzlesSolved: 1, islandsExplored: 1, islandCount: 2, achievementsUnlocked: 1 });
  assert.deepEqual(journal.expeditions.map(({ completed }) => completed), [1, 0]);
  assert.deepEqual(journal.activity.map(({ id }) => id), ["purchase-pin", "achievement-first", "mission-m1"]);
  assert.deepEqual(journal.inventory.equipped.map(item => item.id), ["pin"]);
  assert.deepEqual(journal.inventory.ownedPreview.map(item => item.id), ["pin", "legacy", "fox", "silver"]);
  assert.deepEqual(journal.inventory.owned.map(item => item.id), ["pin", "legacy", "fox", "silver", "gold"]);
  assert.deepEqual(journal.achievements.items[1], { key: "sealed", name: "Sealed Achievement", status: "locked" });
  assert.equal(journal.achievements.recent.length, 1);
});
