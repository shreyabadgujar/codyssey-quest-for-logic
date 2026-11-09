const { entry } = require("./entry");
const { cipher, code } = require("./expansion/build");

const floodline = {
  ...entry(0, "floodline-index", "The Floodline Index", "Medium", "maze",
    "A storm scattered the flood survey across a tiled breakwater. The keeper’s one-dimensional ledger records two sensor offsets, but the field chart wraps the ledger into rows.",
    "Recover the readings at offsets 9 and 18, then reach the exit at minimum energy.",
    "The ledger numbers tiles from zero, left to right across each seven-tile row, including walls. Recover both marked readings in either order. Move orthogonally. Ordinary tiles cost one energy to enter, and rough tiles (~) cost four. You have 17 energy, but only a minimum-energy route seals the survey.",
    { grid: ["S.~..#X", "..C#..~", ".#..D.."], switches: {}, gates: {}, checkpoints: { C: 1, D: 2 },
      required: 3, weights: { "~": 4 }, budget: 17, optimal: true },
    { cost: 13 },
    ["Divide an offset by seven for its zero-based row and take the remainder for its column.",
      "Visit C before D. Row 2 has a wall immediately east of C, so look below C for the connection.",
      "X has only one open neighbor, a rough tile. From D, minimize the number of steps before paying that unavoidable entry cost."],
    "Offsets 9 and 18 are (1,2) and (2,4) in zero-based row and column coordinates. One optimal route goes E, S, E, S, E, E, E, E, N, N. Reaching C and then D costs at least three moves each. The cheapest path from D to X enters four tiles, one rough, for seven energy. Visiting D first already needs at least six moves to D, three to C, and five to X, so it cannot beat 13. Flattened array indices convert back to grid coordinates using division and remainder."),
  tags: ["Flattened arrays", "Row-major indexing", "Weighted grid routes"],
};

const spindle = cipher({
  island: 0, id: "castaway-spindle", title: "The Castaway’s Spindle", tier: "Hard",
  tags: ["Circular arrays", "Modular indexing", "Permutation cycles"],
  story: "A stranded navigator encoded a warning on a twelve-slot spindle. The crank jumps eight slots at a time. The printer broke the strip into rows, but the crank still treats it as one ring.",
  objective: "Calibrate the spindle and reconstruct the warning by reading every index exactly once.",
  alphabet: "HIDETCAR", alignment: 3, rows: ["HEEA", "DHHT", "ITCR"], mode: "stride-cycles", stride: 8,
  reading: "Flatten the printed rows from top to bottom and left to right, numbering slots 0–11. Start at slot 0 and advance by 8 modulo 12. When the next slot has already been read, restart at the smallest unread slot. Read each slot once, even when two slots hold the same letter.",
  answer: "HIDETHECHART",
  hints: ["Count printed positions rather than distinct glyphs. The second row starts at index 4.",
    "The first cycle reads 0, 8, 4. Stepping from 4 wraps back to 0, so start a fresh cycle at 1.",
    "The remaining cycles are 1→9→5, 2→10→6, and 3→11→7. Decode and concatenate each in that order."],
  explanation: "The decoded strip is HEEADHHTITCR in print order. The four index cycles yield HID, ETH, ECH, and ART, giving HIDE THE CHART. The stride and length share a greatest common divisor of four, so a single start reaches only three of the twelve positions. Marking visited indices lets you cover every cycle without losing repeated letters.",
});

const ledger = code({
  island: 0, id: "broken-tide-ledger", title: "The Broken Tide Ledger", tier: "Expert",
  tags: ["Maximum subarray", "One-deletion DP", "Rolling states"],
  story: "The lighthouse’s charge ledger mixes gains and losses. A cracked relay can bypass a single reading during one continuous run. An apprentice’s blueprint wrongly lets the bypass state borrow from a reading that has already been processed.",
  objective: "Repair the rolling states and find the best nonempty continuous run. Each state covers a segment through the current index. Keep retains every reading. Drop skips exactly one reading after the segment’s start, possibly the current one.",
  template: [
    "a = [-4, 3, -6, 5, -2, 4, -8, 6, 2, -1]",
    "keep = a[0]; drop = -∞; best = keep",
    "for x in a[1:]:",
    "    oldKeep = keep",
    "    keep = [1]",
    "    drop = [2]",
    "    best = [3]",
  ].join("\n"),
  choices: [
    ["restart", "max(x, oldKeep + x)"], ["extend", "oldKeep + x"],
    ["bypass", "max(drop + x, oldKeep)"], ["after-update", "max(drop + x, keep)"],
    ["empty", "max(0, drop + x)"], ["peak", "max(best, keep, drop)"],
    ["last", "max(keep, drop)"],
  ],
  questions: ["Keep states at indices 0–9 (comma-separated, no spaces)",
    "Drop states at indices 1–9 (comma-separated, no spaces)", "Best charge (integer)"],
  fragments: ["restart", "bypass", "peak"],
  trace: ["-4,3,-3,5,3,7,-1,6,8,7", "-4,3,8,6,10,7,13,15,14", "15"],
  hints: ["A run must retain its starting reading. Keep tracks a run through the current index with no deletion; drop tracks one with exactly one deletion.",
    "For drop, either retain x after a previous deletion, or skip x and carry the previous keep. If you skip x, its charge must not appear in that state.",
    "Skipping the −8 carries 7 forward. Extending with 6 and 2 reaches 15. Keep the best seen so the final −1 cannot erase it."],
  explanation: "The no-deletion state starts at x or extends the prior run. The one-deletion state extends a prior deletion with x or skips x using oldKeep. It starts impossible at index 0 because every run retains its first reading. An optimum never needs to delete its first reading: the same retained run can start one position later. The best segment spans indices 3–8 and skips index 6, keeping 5−2+4+6+2 = 15. Tracking the overall best yields a linear scan with constant extra space, excluding the written trace.",
});

module.exports = [floodline, spindle, ledger];
