const { test } = require("node:test");
const assert = require("node:assert/strict");
const catalogue = require("../data/achievements");
const Achievement = require("../models/Achievement");
const { summarizeProgress, publicAchievement, unlockEligible } = require("../services/achievementService");

test("catalogue has thirteen distinct valid entries and three unavailable dependencies", () => {
  assert.equal(catalogue.length, 13);
  assert.equal(new Set(catalogue.map(item => item._id)).size, 13);
  for (const entry of catalogue) assert.equal(new Achievement(entry).validateSync(), undefined);
  assert.deepEqual(catalogue.filter(item => item.unavailable).map(item => item.key),
    ["treasure-hunter", "secret-seeker", "legend-of-codyssey"]);
});

test("progress counts unique completed missions, cleared islands, and UTC days", () => {
  const missions = [{ _id: "m1", island: "a" }, { _id: "m2", island: "a" },
    { _id: "m3", island: "b" }, { _id: "m4", island: "c" }];
  const records = [
    { mission: "m1", completedAt: new Date("2026-11-08T23:50Z"), flawless: true },
    { mission: "m1", completedAt: new Date("2026-11-08T23:51Z"), flawless: true },
    { mission: "m2", completedAt: new Date("2026-11-09T00:05Z"), flawless: false },
    { mission: "m3", completedAt: new Date("2026-11-09T17:05Z") },
    { mission: "retired", completedAt: new Date("2026-11-10T00:00Z"), flawless: true },
  ];
  assert.deepEqual(summarizeProgress(missions, records), {
    missions: 3, visitedIslands: 2, clearedIslands: 2, flawless: 1, days: 2,
  });
});

test("locked hidden responses withhold the real key, condition, progress, and reward", () => {
  for (const entry of catalogue.filter(item => item.category === "hidden")) {
    const sealed = publicAchievement(entry, undefined, { days: 2 });
    assert.equal(sealed.name, "Sealed Achievement");
    assert.notEqual(sealed.key, entry.key);
    for (const key of ["rule", "condition", "reward", "progress", "description", "icon", "unavailable"]) assert.ok(!(key in sealed));
  }
});

test("new unlocks credit only the qualifying coins and repeated evaluation has no effects", async () => {
  const ledger = new Set(), session = {};
  let coins = 0;
  const Users = { updateOne: async (query, update, options) => {
    const entry = update.$push.achievements;
    assert.equal(query._id, "user");
    assert.deepEqual(query["achievements.achievement"], { $ne: entry.achievement });
    assert.equal(options.session, session);
    if (ledger.has(entry.achievement)) return { modifiedCount: 0 };
    ledger.add(entry.achievement);
    coins += update.$inc?.coins ?? 0;
    return { modifiedCount: 1 };
  } };
  assert.deepEqual(await unlockEligible("user", {}, session, Users), []);
  const stats = { missions: 1, visitedIslands: 1, flawless: 1, days: 1, clearedIslands: 0 };
  assert.deepEqual((await unlockEligible("user", stats, session, Users)).map(item => item.name), ["First Expedition"]);
  assert.deepEqual(await unlockEligible("user", stats, session, Users), []);
  assert.equal(coins, 30);
  const titles = await unlockEligible("user", { clearedIslands: 10, days: 3 }, session, Users);
  assert.deepEqual(titles.find(item => item.name === "Master Explorer").reward, { title: "Master Explorer" });
  assert.ok(titles.some(item => item.name === "Persistent Explorer" && item.unlocked));
  assert.ok(!titles.some(item => item.name === "Legend of Codyssey"));
});
