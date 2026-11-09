const rows = [
  ["first-expedition", "First Expedition", "exploration", "Your journal records its first solved case.", "Complete your first coding mission.", "missions", 1, { coins: 30 }, "first-discovery"],
  ["island-voyager", "Island Voyager", "exploration", "An entire island’s casebook bears your seal.", "Complete every published mission on one island.", "clearedIslands", 1, { coins: 75 }, "array-explorer"],
  ["world-explorer", "World Explorer", "exploration", "Your investigations span five shores.", "Complete a mission on each of 5 different islands.", "visitedIslands", 5, { coins: 100 }, "master-navigator"],
  ["master-explorer", "Master Explorer", "exploration", "Every island is charted in your journal.", "Complete all 10 islands.", "clearedIslands", 10, { title: "Master Explorer" }, "grand-explorer"],
  ["getting-started", "Getting Started", "coding", "Five cases have yielded to your reasoning.", "Complete 5 coding missions.", "missions", 5, { coins: 50 }],
  ["logic-master", "Logic Master", "coding", "Your deductions hold across a growing casebook.", "Complete 10 coding missions.", "missions", 10, { coins: 60 }],
  ["flawless-solver", "Flawless Solver", "coding", "Three cases closed without a failed verdict.", "Complete 3 missions without an incorrect submission before their first success. Counts completions tracked after this feature launched.", "flawless", 3, { coins: 75 }, "forest-detective"],
  ["knowledge-keeper", "Knowledge Keeper", "coding", "Your archive holds twenty-five solved mysteries.", "Complete 25 coding missions.", "missions", 25, { coins: 100 }],
  ["treasure-hunter", "Treasure Hunter", "collection", "Recover a real treasure from the islands.", "Collect your first in-game treasure.", null, 1, { coins: 40 }, null, "Treasure collection is not available yet."],
  ["secret-seeker", "Secret Seeker", "hidden", "You followed a clue beyond the known chart.", "Complete a hidden bonus challenge.", null, 1, { badge: true }, null, "Hidden bonus challenges are not available yet."],
  ["persistent-explorer", "Persistent Explorer", "hidden", "You returned to the expedition on three different days.", "Complete missions on 3 separate UTC calendar days.", "days", 3, { coins: 60 }],
  ["legend-of-codyssey", "Legend of Codyssey", "hidden", "Every other honour is recorded under your name.", "Unlock every other achievement.", null, 11, { title: "Legend of Codyssey" }, null, "Requires the unavailable treasure and bonus challenge achievements."],
];

module.exports = rows.map(([key, name, category, description, condition, metric, threshold, reward, badge, unavailable], index) => ({
  _id: "636f646573616368696576" + (index + 1).toString(16).padStart(2, "0"),
  key, name, category, description, condition, rule: { metric, threshold }, reward,
  icon: badge ? `/assets/badges/${badge}.webp` : undefined, unavailable,
}));
