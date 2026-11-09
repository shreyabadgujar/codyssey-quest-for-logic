const User = require("../models/User");
const ShopItem = require("../models/ShopItem");
const { isObjectIdOrHexString } = require("mongoose");
const BASE_AVATARS = new Set(["explorer-01", "explorer-02", "explorer-03", "explorer-04"]);
const EQUIPMENT_SLOTS = new Set(["frame", "background", "pin", "companion"]);

async function equipAvatar(userId, body, UserModel = User) {
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      Object.keys(body).length !== 1 || !BASE_AVATARS.has(body.base)) {
    throw Object.assign(new Error("Choose an available explorer avatar"), {
      status: 400, code: "INVALID_AVATAR",
    });
  }
  const user = await UserModel.findByIdAndUpdate(userId, {
    $set: { "avatar.base": body.base },
  }, { new: true });
  if (!user) throw Object.assign(new Error("User not found"), { status: 404, code: "USER_NOT_FOUND" });
  return user;
}

const equipmentError = (status, code, message) => Object.assign(new Error(message), { status, code });

async function equipItem(userId, body, { Users = User, Items = ShopItem } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      Object.keys(body).length !== 2 || !EQUIPMENT_SLOTS.has(body.slot) ||
      (body.itemId !== null && (typeof body.itemId !== "string" || !isObjectIdOrHexString(body.itemId)))) {
    throw equipmentError(400, "INVALID_EQUIPMENT", "Choose a valid equipment slot and item.");
  }

  const path = `avatar.equipped.${body.slot}`;
  if (body.itemId === null) {
    const user = await Users.findByIdAndUpdate(userId, { $unset: { [path]: 1 } }, { new: true });
    if (!user) throw equipmentError(404, "USER_NOT_FOUND", "Explorer account not found.");
    return user;
  }

  const item = await Items.findOne({ _id: body.itemId, slot: body.slot }).select("_id").lean();
  if (!item) throw equipmentError(404, "EQUIPMENT_NOT_FOUND", "This item does not fit that equipment slot.");
  const user = await Users.findOneAndUpdate({ _id: userId, inventory: item._id },
    { $set: { [path]: item._id } }, { new: true });
  if (!user) throw equipmentError(403, "ITEM_NOT_OWNED", "Buy this item before equipping it.");
  return user;
}

module.exports = { equipAvatar, equipItem };
