const { Schema, model } = require("mongoose");

const islandSchema = new Schema({
  slug: { type: String, required: true, unique: true }, // matches frontend/src/data/islands.js id
  name: { type: String, required: true },
  topic: { type: String, required: true },
  description: String,
  image: String,
  order: { type: Number, required: true },
  mapPosition: { x: Number, y: Number },
  totalLevels: { type: Number, default: 0 },
  completionReward: { coins: Number, xp: Number, artifact: String },
});

module.exports = model("Island", islandSchema);
