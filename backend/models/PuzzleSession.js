const { Schema, model } = require("mongoose");
const puzzleSession = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  milestone: { type: Number, required: true },
  puzzleId: { type: String, required: true },
  status: { type: String, enum: ["available", "active", "skipped", "completed"], default: "available" },
  draft: { type: Schema.Types.Mixed, default: () => ({}) },
  revision: { type: Number, default: 0 },
  hintsUsed: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  lastVerdict: { type: String, enum: ["correct", "incorrect", "incomplete", "invalid"] },
  coinsAwarded: { type: Number, default: 0 },
  completedAt: Date,
}, { timestamps: true, minimize: false });

puzzleSession.index({ user: 1, milestone: 1 }, { unique: true });
puzzleSession.index({ user: 1, puzzleId: 1 }, { unique: true });
module.exports = model("PuzzleSession", puzzleSession);
