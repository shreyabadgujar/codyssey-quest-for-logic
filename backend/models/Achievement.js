const { Schema, model } = require("mongoose");

module.exports = model("Achievement", new Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  icon: String,
  category: String,
  condition: String,
  rule: { metric: String, threshold: Number },
  reward: { coins: Number, title: String, badge: Boolean },
  unavailable: String,
}));
