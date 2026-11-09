const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  // Economy fields are server-managed only; never accept them from request bodies.
  xp: { type: Number, default: 0, min: 0 },
  level: { type: Number, default: 1, min: 1 },
  coins: { type: Number, default: 0, min: 0 },
  avatar: {
    base: { type: String, default: "default" },
    equipped: { type: Map, of: Schema.Types.ObjectId, default: {} }, // slot -> ShopItem
  },
  inventory: [{ type: Schema.Types.ObjectId, ref: "ShopItem" }],
  inventoryPurchases: [{
    _id: false,
    item: { type: Schema.Types.ObjectId, ref: "ShopItem", required: true },
    purchasedAt: { type: Date, required: true },
  }],
  achievements: [{
    achievement: { type: Schema.Types.ObjectId, ref: "Achievement" },
    unlockedAt: Date,
    reward: { coins: Number, title: String, badge: Boolean },
  }],
  streak: { count: { type: Number, default: 0 }, lastClaimDate: Date },
}, { timestamps: true });

module.exports = model("User", userSchema);
