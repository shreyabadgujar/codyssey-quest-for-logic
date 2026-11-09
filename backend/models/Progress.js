const { Schema, model } = require("mongoose");

// One record per user per mission. Source of truth for unlocks and "reward once" logic.
const progressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  mission: { type: Schema.Types.ObjectId, ref: "Mission", required: true },
  island: { type: Schema.Types.ObjectId, ref: "Island", required: true },
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
  attempts: { type: Number, default: 0 },
  incorrectSubmissions: { type: Number, default: 0 },
  flawless: Boolean,
  languageUsed: { type: String, enum: ["c", "cpp", "python", "java"] },
  completedAt: Date,
  objectFound: { type: Boolean, default: false },
  rewardsGranted: { type: Boolean, default: false },
}, { timestamps: true });
progressSchema.index({ user: 1, mission: 1 }, { unique: true });

module.exports = model("Progress", progressSchema);
