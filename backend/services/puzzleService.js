const mongoose = require("mongoose");
const PuzzleSession = require("../models/PuzzleSession");
const Island = require("../models/Island");
const Progress = require("../models/Progress");
const User = require("../models/User");
const { unlockEligible } = require("./achievementService");
const { bank, byId, playable } = require("../data/puzzles");
const { assignments, puzzleCandidates, MISSIONS_PER_PUZZLE } = require("./puzzleSelectionService");
const { validate } = require("./puzzleValidationService");

const error = (message, status = 400, code = "INVALID_PUZZLE_REQUEST") => Object.assign(new Error(message), { status, code });
const missing = () => error("Artifact transmission not found.", 404, "PUZZLE_NOT_FOUND");
const conflict = () => error("This transmission changed elsewhere. Reload its saved state to continue.", 409, "PUZZLE_CONFLICT");
const record = value => value !== null && typeof value === "object" && !Array.isArray(value);
const allowedKeys = (value, keys) => record(value) && Object.keys(value).every(key => keys.includes(key));
const enumList = (values, allowed, limit) => Array.isArray(values) && values.length <= limit && values.every(value => allowed.includes(value));
const finishedMissionFilter = user => ({ user, status: "completed", rewardsGranted: true });

function checkedDraft(puzzle, input) {
  const { mechanic, data } = puzzle;
  let valid = false;
  if (mechanic === "detective") {
    const ids = data.suspects.map(s => s.id);
    valid = allowedKeys(input, ["suspect", "evidence", "eliminated"]) && (input.suspect === undefined || ["", ...ids].includes(input.suspect))
      && (input.evidence === undefined || enumList(input.evidence, data.evidence.map(e => e.id), data.evidence.length))
      && (input.eliminated === undefined || enumList(input.eliminated, ids, ids.length));
  } else if (mechanic === "arrangement") {
    valid = allowedKeys(input, ["steps"]) && (input.steps === undefined || (Array.isArray(input.steps) && input.steps.length <= data.items.length &&
      input.steps.every(step => allowedKeys(step, ["id", "turn"]) && data.items.some(i => i.id === step.id) && [0,90,180,270].includes(step.turn))));
  } else if (mechanic === "cipher") {
    valid = allowedKeys(input, ["wheel", "mapping", "message"]) &&
      (input.wheel === undefined || Number.isInteger(input.wheel) && input.wheel >= 0 && input.wheel < data.ring.length) &&
      (input.mapping === undefined || allowedKeys(input.mapping, data.symbols) && Object.values(input.mapping).every(letter => ["", ...data.alphabet].includes(letter))) &&
      (input.message === undefined || typeof input.message === "string" && /^[a-zA-Z\s]{0,80}$/.test(input.message));
  } else if (mechanic === "maze") {
    valid = allowedKeys(input, ["moves"]) && (input.moves === undefined || enumList(input.moves, ["N","S","E","W","activate"], data.budget));
  } else if (mechanic === "workshop") {
    valid = allowedKeys(input, ["operations"]) && (input.operations === undefined || enumList(input.operations, data.ops.map(op => op.id), data.limit));
  } else if (mechanic === "code") {
    valid = allowedKeys(input, ["fragments", "trace"]) &&
      (input.fragments === undefined || enumList(input.fragments, ["", ...data.choices.map(c => c.id)], data.slots)) &&
      (input.trace === undefined || Array.isArray(input.trace) && input.trace.length <= data.questions.length &&
        input.trace.every(value => typeof value === "string" && value.length <= 80));
  }
  if (!valid) throw error("This interaction is not valid for the artifact.");
  return input;
}

function summary(row) {
  const { id, title, island, difficulty, mechanic, coins, minutes } = byId.get(row.puzzleId);
  return { id: String(row._id), puzzleId: id, title, island, difficulty, mechanic, coins, minutes,
    milestone: row.milestone, status: row.status, attempts: row.attempts, coinsAwarded: row.coinsAwarded, completedAt: row.completedAt };
}

function view(row) {
  const puzzle = byId.get(row.puzzleId);
  return { ...summary(row), puzzle: playable(puzzle), revision: row.revision, draft: row.draft,
    hints: puzzle.hints.slice(0, row.hintsUsed), hintTotal: puzzle.hints.length, verdict: row.lastVerdict,
    ...(row.status === "completed" ? { explanation: puzzle.explanation } : {}) };
}

function catalogueFor(sessions, upcoming, islands) {
  const assigned = new Map(sessions.map(row => [row.puzzleId, row]));
  const islandNames = new Map(islands.map(island => [island.slug, island.name]));
  return bank.map(({ id, title, island, difficulty, mechanic, story }) => {
    const row = assigned.get(id);
    const islandName = islandNames.get(island) ?? (island === "stack-queue-depths"
      ? "Stack & Queue Depths"
      : island.split("-").map(word => word === "of" ? word : word[0].toUpperCase() + word.slice(1)).join(" "));
    const status = row ? (row.status === "completed" ? "completed" : "available")
      : upcoming.has(id) ? "upcoming" : "locked";
    return {
      puzzleId: id, title, islandId: island, islandName, difficulty, mechanic, synopsis: story, status,
      ...(row ? { sessionId: String(row._id), sessionStatus: row.status } : {}),
    };
  });
}

function createPuzzleService({ connection = mongoose.connection, Sessions = PuzzleSession, Users = User, Records = Progress,
  Islands = Island, unlock = unlockEligible, random = Math.random } = {}) {
  async function count(user, session) {
    return Records.countDocuments(finishedMissionFilter(user)).session(session ?? null);
  }

  async function lobby(user) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await connection.transaction(async session => {
          const completed = await count(user, session);
          const history = await Sessions.find({ user }).sort({ milestone: 1 }).session(session).lean();
          const additions = assignments(user, completed, history, random);
          const inserted = additions.length ? await Sessions.insertMany(additions, { session }) : [];
          const sessions = [...history, ...inserted].sort((a, b) => a.milestone - b.milestone);
          const rows = sessions.filter(row => byId.has(row.puzzleId));
          const current = rows.find(row => row.status === "active") || rows.find(row => row.status === "available");
          const entries = rows.map(summary);
          const missionsToNext = MISSIONS_PER_PUZZLE - completed % MISSIONS_PER_PUZZLE;
          const candidates = puzzleCandidates(sessions);
          const upcoming = new Set(missionsToNext === 1 ? candidates.map(puzzle => puzzle.id) : []);
          const islands = await Islands.find({ slug: { $in: [...new Set(bank.map(puzzle => puzzle.island))] } })
            .select("slug name").session(session).lean();
          return { current: current ? summary(current) : null, history: entries.reverse(), missionsCompleted: completed,
            missionsToNext, exhausted: candidates.length === 0, catalogue: catalogueFor(rows, upcoming, islands) };
        });
      } catch (err) {
        if (err.code !== 11000 || attempt >= 4) throw err;
      }
    }
  }

  async function open(user, id) {
    if (!mongoose.isObjectIdOrHexString(id)) throw missing();
    const row = await Sessions.findOne({ _id: id, user }).lean();
    if (!row || !byId.has(row.puzzleId)) throw missing();
    return view(row);
  }

  async function act(user, id, action, body) {
    if (!mongoose.isObjectIdOrHexString(id)) throw missing();
    if (!["start","draft","hint","reset","skip","submit"].includes(action)) throw missing();
    if (!allowedKeys(body, action === "draft" ? ["revision", "draft"] : ["revision"]) ||
        !Number.isSafeInteger(body.revision) || body.revision < 0) throw error("A saved transmission revision is required.");

    async function change(session) {
      const query = { _id: id, user };
      const row = await Sessions.findOne(query).session(session ?? null).lean();
      if (!row || !byId.has(row.puzzleId)) throw missing();
      if (row.status === "completed") return { ...view(row), alreadyRewarded: action === "submit" };
      if (action === "start" && row.status === "active") return view(row);
      if (row.revision !== body.revision) throw conflict();
      const puzzle = byId.get(row.puzzleId);
      const fields = {}, increment = { revision: 1 };
      let awarded = false, clearVerdict = false;
      if (action === "start") fields.status = "active";
      else if (action === "skip") fields.status = "skipped";
      else {
        if (row.status !== "active") throw error("Open the artifact before interacting.", 409, "PUZZLE_NOT_ACTIVE");
        if (action === "draft") {
          fields.draft = checkedDraft(puzzle, body.draft);
          clearVerdict = true;
        } else if (action === "hint") {
          if (row.hintsUsed >= puzzle.hints.length) return view(row);
          increment.hintsUsed = 1;
        } else if (action === "reset") {
          fields.draft = {};
          clearVerdict = true;
        } else if (action === "submit") {
          fields.lastVerdict = validate(puzzle, row.draft);
          increment.attempts = 1;
          if (fields.lastVerdict === "correct") {
            awarded = true;
            Object.assign(fields, { status: "completed", completedAt: new Date(), coinsAwarded: puzzle.coins });
          }
        }
      }
      const updated = await Sessions.findOneAndUpdate({ ...query, revision: row.revision, status: row.status },
        { $set: fields, $inc: increment, ...(clearVerdict ? { $unset: { lastVerdict: 1 } } : {}) }, { new: true, session }).lean();
      if (!updated) throw conflict();
      if (!awarded) return view(updated);
      const credit = await Users.updateOne({ _id: user }, { $inc: { coins: puzzle.coins } }, { session });
      if (credit.matchedCount !== 1) throw missing();
      const achievements = await unlock(user, { puzzles: 1 }, session);
      return { ...view(updated), awarded: puzzle.coins, achievements };
    }
    return action === "submit" ? connection.transaction(change) : change(null);
  }
  return { lobby, open, act, count };
}
module.exports = { createPuzzleService, ...createPuzzleService(), checkedDraft, finishedMissionFilter };
