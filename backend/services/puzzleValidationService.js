const result = (ok, incomplete = false) => ok ? "correct" : incomplete ? "incomplete" : "incorrect";
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const directions = { N: [-1, 0], E: [0, 1], S: [1, 0], W: [0, -1] };
const mazeMoves = [...Object.keys(directions), "activate"];

function mazeStart(data) {
  const row = data.grid.findIndex(line => line.includes("S"));
  return { row, col: data.grid[row].indexOf("S"), flags: 0, cost: 0 };
}

function mazeStep(data, state, move) {
  const { row, col, flags, cost } = state;
  if (move === "activate") {
    const bit = data.switches[data.grid[row][col]];
    return bit && !(flags & bit) ? { ...state, flags: flags | bit, cost: cost + 1 } : null;
  }
  if (!Object.hasOwn(directions, move)) return null;
  const [dr, dc] = directions[move];
  const tile = data.grid[row + dr]?.[col + dc];
  if (!tile || tile === "#" || (data.gates[tile] && !(flags & data.gates[tile]))) return null;
  return { row: row + dr, col: col + dc, flags: flags | (data.checkpoints[tile] || 0), cost: cost + (data.weights[tile] || 1) };
}

function mazeFinished(data, state) {
  return data.grid[state.row][state.col] === "X" && (state.flags & data.required) === data.required;
}

function shortestRoute(data) {
  const start = mazeStart(data);
  const queue = [{ state: start, moves: [] }];
  const settled = new Set();
  while (queue.length) {
    queue.sort((a, b) => b.state.cost - a.state.cost);
    const { state, moves } = queue.pop();
    const key = [state.row, state.col, state.flags].join(":");
    if (settled.has(key)) continue;
    settled.add(key);
    if (mazeFinished(data, state)) return { cost: state.cost, moves };
    for (const move of mazeMoves) {
      const next = mazeStep(data, state, move);
      if (next) queue.push({ state: next, moves: [...moves, move] });
    }
  }
  return null;
}

function workshopStep(type, state, op) {
  const { cells, observations } = state;
  const next = [...cells];
  const notes = [...observations];
  const { action, value, index } = op;
  const treePath = () => {
    const path = [];
    let i = 0;
    while (next[i] != null) {
      path.push(next[i]);
      if (next[i] === value) break;
      i = 2 * i + (value < next[i] ? 1 : 2);
    }
    return { i, path };
  };
  if ((type === "stack" && action === "push") || (type === "queue" && action === "enqueue")) next.push(value);
  else if (type === "stack" && action === "pop" && next.length) notes.push(next.pop());
  else if (type === "stack" && action === "peek" && next.length) notes.push(next.at(-1));
  else if (type === "stack" && action === "duplicate" && next.length) next.push(next.at(-1));
  else if (type === "stack" && action === "swap" && next.length >= 2) {
    const last = next.length - 1;
    [next[last], next[last - 1]] = [next[last - 1], next[last]];
  }
  else if (type === "queue" && action === "dequeue" && next.length) notes.push(next.shift());
  else if (["array", "list"].includes(type) && action === "insert" && index >= 0 && index <= next.length) next.splice(index, 0, value);
  else if (["array", "list"].includes(type) && action === "delete" && index >= 0 && index < next.length) notes.push(next.splice(index, 1)[0]);
  else if (type === "tree" && action === "insert") {
    const { i } = treePath();
    if (next[i] != null || i >= 31) return null;
    while (next.length <= i) next.push(null);
    next[i] = value;
  } else if (type === "tree" && action === "search") {
    notes.push(treePath().path.join("→"));
  } else if (type === "tree" && action === "traverse") {
    const visit = i => next[i] == null ? [] : [...visit(2 * i + 1), next[i], ...visit(2 * i + 2)];
    notes.push(visit(0).join("→"));
  } else if (["list", "array"].includes(type) && action === "search") notes.push(next.indexOf(value));
  else return null;
  return { cells: next, observations: notes };
}

function detectiveCandidates(data) {
  return data.suspects.filter(suspect => data.evidence.filter(e => e.required)
    .every(e => e.matches.includes(suspect.id))).map(suspect => suspect.id);
}

function arrangementState(data, steps) {
  let energy = data.energy;
  let value = 0;
  const used = new Set();
  for (const step of steps) {
    const item = data.items.find(entry => entry.id === step.id);
    if (!item || used.has(item.id) || !item.requires.every(id => used.has(id)) ||
        (item.rotation != null && step.turn !== item.rotation)) return null;
    energy -= item.cost;
    if (energy < 0) return null;
    value += item.value;
    used.add(item.id);
  }
  return { energy, value, used };
}

function cipherMessage(data, key, wheel) {
  const rows = data.groups.map(group => group.map(symbol => key[symbol]).join(""));
  if (data.mode === "reverse") rows.reverse();
  if (data.mode === "alternating") rows.forEach((row, i) => { if (i % 2) rows[i] = [...row].reverse().join(""); });
  if (data.mode === "columns") return [...rows[0]].map((_, i) => rows.map(row => row[i]).join("")).join("");
  if (data.mode === "rail") return [...rows[0]].map((letter, i) => letter + (rows[1][i] || "")).join("");
  if (data.mode === "rotate") for (let i = 0; i < wheel; i++) rows.push(rows.shift());
  if (data.mode === "stride-cycles") {
    const cells = rows.join("");
    const seen = new Set();
    let message = "";
    for (let start = 0; start < cells.length; start++) {
      for (let i = start; !seen.has(i); i = (i + data.stride) % cells.length) {
        message += cells[i];
        seen.add(i);
      }
    }
    return message;
  }
  if (data.mode === "diagonal") {
    return rows.flatMap((row, r) => [...row].map((letter, c) => ({ letter, r, c })))
      .sort((a, b) => a.r + a.c - b.r - b.c || a.r - b.r).map(cell => cell.letter).join("");
  }
  if (data.mode === "outside-in" || data.mode === "mirror-columns") {
    const width = rows[0].length;
    return Array.from({ length: width }, (_, i) => {
      const column = data.mode === "outside-in" ? (i % 2 ? width - 1 - Math.floor(i / 2) : i / 2) : width - 1 - i;
      const letters = rows.map(row => row[column]);
      if (data.mode === "mirror-columns" && i % 2 === 0) letters.reverse();
      return letters.join("");
    }).join("");
  }
  return rows.join("");
}

const validators = {
  detective({ data, solution }, a) {
    if (!a.suspect || !a.evidence?.length) return "incomplete";
    const selected = [...new Set(a.evidence)].sort();
    return result(a.suspect === solution.suspect && same(selected, [...solution.evidence].sort()),
      selected.length < data.links);
  },
  arrangement({ data, solution }, a) {
    if (!a.steps?.length) return "incomplete";
    const state = arrangementState(data, a.steps);
    if (!state) return "invalid";
    if (!data.items.filter(i => i.mandatory).every(i => state.used.has(i.id))) return "incomplete";
    return result(state.value >= solution.value);
  },
  cipher({ data, solution }, a) {
    if (!a.message?.trim() || data.symbols.some(symbol => !a.mapping?.[symbol])) return "incomplete";
    return result(a.wheel === data.alignment && data.symbols.every(symbol => a.mapping[symbol] === solution.key[symbol]) &&
      a.message.replace(/\s+/g, "").toUpperCase() === cipherMessage(data, solution.key, data.alignment));
  },
  maze({ data, solution }, a) {
    let state = mazeStart(data);
    for (const move of a.moves || []) {
      state = mazeStep(data, state, move);
      if (!state || state.cost > data.budget) return "invalid";
    }
    return result(mazeFinished(data, state) && (!data.optimal || state.cost === solution.cost), !mazeFinished(data, state));
  },
  workshop({ data }, a) {
    let state = { cells: data.initial, observations: [] };
    for (const id of a.operations || []) {
      const op = data.ops.find(op => op.id === id);
      if (!op || !(state = workshopStep(data.type, state, op))) return "invalid";
    }
    if ((a.operations?.length || 0) > data.limit) return "invalid";
    return result(same(state.cells, data.target) && same(state.observations, data.observations),
      (a.operations?.length || 0) < data.limit);
  },
  code({ data, solution }, a) {
    if (a.fragments?.length !== data.slots || a.fragments.some(id => !id) || a.trace?.length !== solution.trace.length ||
        a.trace.some(value => !value.trim())) return "incomplete";
    return result(same(a.fragments, solution.fragments) && a.trace.every((value, i) => value.trim() === solution.trace[i]));
  },
};

function validate(puzzle, answer) {
  return validators[puzzle.mechanic](puzzle, answer);
}

module.exports = { validate, mazeStart, mazeStep, mazeFinished, shortestRoute, workshopStep, detectiveCandidates, arrangementState, cipherMessage };
