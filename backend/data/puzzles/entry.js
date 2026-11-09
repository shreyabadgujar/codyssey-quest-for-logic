const islands = ["array-archipelago", "linked-isles", "stack-queue-depths", "sorting-sands", "searching-peaks", "tree-of-secrets", "graphbound-kingdom", "recursion-realm", "stringwood-forest", "dynamic-programming-dimension"];
const levels = { Easy: [15, 3], Medium: [25, 6], Hard: [40, 10], Expert: [60, 15] };
function entry(island, id, title, difficulty, mechanic, story, objective, instructions, data, solution, hints, explanation) {
  const [coins, minutes] = levels[difficulty];
  return { id, title, island: islands[island], difficulty, mechanic, story, objective, instructions, data, solution, hints, explanation, coins, minutes };
}
module.exports = { entry };
