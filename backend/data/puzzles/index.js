const original = ["detective", "arrangement", "cipher", "maze", "workshop", "code"].flatMap(file => require("./" + file));
const bank = [...original, ...require("./expansion"), ...require("./arrayArchipelago")];
const byId = new Map(bank.map(puzzle => [puzzle.id, puzzle]));
function playable(puzzle) {
  const { solution, hints, explanation, data, ...info } = puzzle;
  if (info.mechanic === "detective") {
    const { evidence, ...rest } = data;
    return { ...info, data: { ...rest, evidence: evidence.map(({ id, title, text }) => ({ id, title, text })) } };
  }
  if (info.mechanic === "cipher") {
    const { alignment, ...rest } = data;
    return { ...info, data: rest };
  }
  return { ...info, data };
}
module.exports = { bank, byId, playable };
