const { Schema, model } = require("mongoose");

module.exports = model("ShopItem", new Schema({
  name: { type: String, required: true },
  slot: { type: String, enum: ["outfit", "hat", "accessory", "frame", "background", "pin", "companion"], required: true },
  price: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  asset: String,
  visual: String,
  description: String,
}));
