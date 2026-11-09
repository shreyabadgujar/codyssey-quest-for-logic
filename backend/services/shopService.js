const { isObjectIdOrHexString } = require("mongoose");
const ShopItem = require("../models/ShopItem");
const User = require("../models/User");
const catalogue = require("../data/shopCatalogue");

const slots = ["frame", "background", "pin", "companion"];
const shopError = (status, code, message) => Object.assign(new Error(message), { status, code });

async function seedShop() {
  await ShopItem.bulkWrite(catalogue.map(({ _id, ...fields }) => ({
    updateOne: { filter: { _id }, update: { $setOnInsert: fields }, upsert: true },
  })));
}

function createShopService({ Items = ShopItem, Users = User, now = () => new Date() } = {}) {
  async function listItems(user) {
    const inventory = new Set((user.inventory ?? []).map(String));
    const items = await Items.find({ slot: { $in: slots } }).sort({ _id: 1 }).lean();
    return items.map(({ _id, name, slot, price, asset, visual, description }) => ({
      id: String(_id), name, slot, price, asset, visual, description, owned: inventory.has(String(_id)),
    }));
  }

  async function purchase(userId, body) {
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        Object.keys(body).length !== 1 || typeof body.itemId !== "string" || !isObjectIdOrHexString(body.itemId)) {
      throw shopError(400, "INVALID_ITEM", "Choose a valid item from the catalogue.");
    }

    const item = await Items.findOne({ _id: body.itemId, slot: { $in: slots } }).lean();
    if (!item) throw shopError(404, "ITEM_NOT_FOUND", "This item is no longer available.");
    if (!Number.isSafeInteger(item.price) || item.price < 0) {
      throw shopError(409, "ITEM_UNAVAILABLE", "This item cannot be purchased right now.");
    }

    // One MongoDB document update checks both preconditions and writes both effects atomically.
    const user = await Users.findOneAndUpdate({
      _id: userId, coins: { $gte: item.price }, inventory: { $ne: item._id },
    }, {
      $inc: { coins: -item.price }, $addToSet: { inventory: item._id },
      $push: { inventoryPurchases: { item: item._id, purchasedAt: now() } },
    }, { new: true });

    if (user) return user;

    const current = await Users.findById(userId).select("coins inventory").lean();
    if (!current) throw shopError(404, "USER_NOT_FOUND", "Explorer account not found.");
    if (current.inventory?.some(id => String(id) === String(item._id))) {
      throw shopError(409, "ITEM_ALREADY_OWNED", "This item is already in your inventory.");
    }
    if (current.coins < item.price) {
      throw shopError(409, "INSUFFICIENT_COINS", "You don’t have enough coins for this item.");
    }
    throw shopError(409, "BALANCE_CHANGED", "Your account changed. Review your balance and try again.");
  }

  return { listItems, purchase };
}

module.exports = { ...createShopService(), createShopService, seedShop };
