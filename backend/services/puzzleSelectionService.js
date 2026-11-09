const { bank } = require("../data/puzzles");
const WEIGHTS = { Easy: 5, Medium: 20, Hard: 55, Expert: 20 };

function puzzleCandidates(history, pool = bank) {
  const seen = new Set(history.map(row => row.puzzleId));
  const last = pool.find(puzzle => puzzle.id === history.at(-1)?.puzzleId);
  const unseen = pool.filter(puzzle => !puzzle.inactive && !seen.has(puzzle.id) && WEIGHTS[puzzle.difficulty] && puzzle.solution);
  const alternate = unseen.filter(puzzle => puzzle.mechanic !== last?.mechanic);
  return alternate.length ? alternate : unseen;
}

function selectPuzzle(history, random = Math.random, pool = bank) {
  const choices = puzzleCandidates(history, pool);
  const tiers = Object.entries(WEIGHTS).filter(([tier]) => choices.some(puzzle => puzzle.difficulty === tier));
  if (!tiers.length) return null;
  let roll = random() * tiers.reduce((total, [, weight]) => total + weight, 0);
  const tier = tiers.find(([, weight]) => (roll -= weight) < 0)[0];
  const candidates = choices.filter(puzzle => puzzle.difficulty === tier);
  return candidates[Math.floor(random() * candidates.length)];
}

const MISSIONS_PER_PUZZLE = 2;
const milestoneReached = count => count > 0 && count % MISSIONS_PER_PUZZLE === 0 &&
  count <= bank.filter(puzzle => !puzzle.inactive).length * MISSIONS_PER_PUZZLE;

function assignments(user, completed, history, random) {
  const rows = [];
  const usedMilestones = new Set(history.map(row => row.milestone));
  const prior = [...history];
  for (let milestone = MISSIONS_PER_PUZZLE; milestone <= completed; milestone += MISSIONS_PER_PUZZLE) {
    if (usedMilestones.has(milestone)) continue;
    const next = selectPuzzle(prior, random);
    if (!next) break;
    const row = { user, milestone, puzzleId: next.id };
    rows.push(row);
    prior.push(row);
  }
  return rows;
}
module.exports = { WEIGHTS, MISSIONS_PER_PUZZLE, milestoneReached, puzzleCandidates, selectPuzzle, assignments };
