const { entry } = require("../entry");

function build(mechanic, spec, instructions, data, solution) {
  const { island, id, title, tier, story, objective, hints, explanation, tags } = spec;
  return { ...entry(island, id, title, tier, mechanic, story, objective, instructions, data, solution, hints, explanation), tags };
}

function detective(spec) {
  const suspects = spec.suspects.map(([id, name, ...values]) => ({ id, name, values }));
  const evidence = spec.evidence.map(([id, title, text, matches]) => ({ id, title, text, matches: matches ?? [], required: Boolean(matches) }));
  return build("detective", spec,
    "Work through each record using the rules in the case file. Pin the records that distinguish the culprit and select the matching profile. Leave background notes unpinned.",
    { columns: spec.columns, suspects, evidence, links: evidence.filter(record => record.required).length },
    { suspect: spec.suspect, evidence: evidence.filter(record => record.required).map(record => record.id) });
}

function arrangement(spec) {
  const items = spec.items.map(([id, name, cost, requires, rotation, mandatory, value = 0]) =>
    ({ id, name, cost, requires, rotation, mandatory, value }));
  return build("arrangement", spec,
    "Add pieces to the rail and arrange them in installation order. Install prerequisites first, match the marked rotations, and fit the energy budget. Starred pieces must be installed. When the objective asks for maximum yield, optional pieces count toward it.",
    { energy: spec.energy, items }, { value: spec.value, witness: spec.witness });
}

function workshop(spec) {
  const ops = spec.ops.map(([id, label, action, value, index]) => ({ id, label, action, value, index }));
  const { type, initial, target, observations, limit } = spec;
  return build("workshop", spec,
    "Select tools to build the target memory and reproduce every sensor reading in order. Reads and removals log a value. Insertions do not. You may reuse tools and undo your last step. Use at most " + limit + " operations. " + spec.rules,
    { type, initial, target, observations, limit, ops }, { witness: spec.witness });
}

function maze(spec) {
  return build("maze", spec,
    "Start at S and move orthogonally to X. Walls block movement. Ordinary tiles cost one energy and rough tiles have the cost shown on the map. Activate a switch on its tile for one energy. Switches stay on and checkpoints are recorded on entry. Meet every required objective and minimize energy.",
    { grid: spec.grid, switches: spec.switches, gates: spec.gates, checkpoints: spec.checkpoints,
      required: spec.required, weights: spec.weights, budget: spec.budget, optimal: true },
    { cost: spec.cost });
}

const glyphs = [..."◈✦◇⬡⊙◐△◉✶▣◬☷⟐✧⬟◒"];
function cipher(spec) {
  const alphabet = [...spec.alphabet];
  const ring = glyphs.slice(0, alphabet.length);
  const aligned = [...ring.slice(spec.alignment), ...ring.slice(0, spec.alignment)];
  const key = Object.fromEntries(aligned.map((symbol, index) => [symbol, alphabet[index]]));
  const groups = spec.rows.map(row => [...row].map(letter => aligned[alphabet.indexOf(letter)]));
  if (groups.some(row => row.some(symbol => !symbol))) throw new Error("Unknown letter in " + spec.id);
  return build("cipher", spec,
    "Align the stamped letter and glyph on the wheel. Enter the matching letters for every glyph used below, then read the rows in the stated order. Spaces in your recovered transmission are optional.",
    { alphabet, ring, alignment: spec.alignment, calibration: { glyph: aligned[0], letter: alphabet[0] },
      groups, symbols: [...new Set(groups.flat())].sort(), mode: spec.mode, reading: spec.reading,
      ...(spec.stride === undefined ? {} : { stride: spec.stride }) },
    { key, answer: spec.answer });
}

function code(spec) {
  return build("code", spec,
    "Choose one fragment for every numbered slot. Trace the resulting blueprint on the supplied input and enter each requested value in the stated format.",
    { template: spec.template, choices: spec.choices.map(([id, label]) => ({ id, label })),
      questions: spec.questions, slots: spec.fragments.length },
    { fragments: spec.fragments, trace: spec.trace });
}

module.exports = { detective, arrangement, workshop, maze, cipher, code };
