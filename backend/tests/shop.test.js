const { test } = require("node:test");
const assert = require("node:assert/strict");
const ShopItem = require("../models/ShopItem");
const catalogue = require("../data/shopCatalogue");
const { createShopService } = require("../services/shopService");

const item = catalogue.find(entry => entry.name === "Compass Pin");
const items = { findOne: () => ({ lean: async () => item }) };

test("starter catalogue validates, with stable unique inventory IDs", () => {
  assert.equal(catalogue.length, 12);
  assert.equal(new Set(catalogue.map(entry => entry._id)).size, 12);
  for (const slot of ["frame", "background", "pin", "companion"]) {
    assert.equal(catalogue.filter(entry => entry.slot === slot).length, 3);
  }
  for (const entry of catalogue) assert.equal(new ShopItem(entry).validateSync(), undefined);
});

test("purchase uses the stored price and guards a single account update", async () => {
  const updated = { coins: 0, inventory: [item._id], avatar: { base: "explorer-02" } };
  const purchasedAt = new Date("2026-11-09T00:00:00Z");
  const Users = {
    findOneAndUpdate: async (filter, change, options) => {
      assert.deepEqual(filter, { _id: "player", coins: { $gte: item.price }, inventory: { $ne: item._id } });
      assert.deepEqual(change, { $inc: { coins: -item.price }, $addToSet: { inventory: item._id },
        $push: { inventoryPurchases: { item: item._id, purchasedAt } } });
      assert.deepEqual(options, { new: true });
      return updated;
    },
  };
  assert.equal(await createShopService({ Items: items, Users, now: () => purchasedAt }).purchase("player", { itemId: item._id }), updated);
});

test("rejects malformed, client-priced and missing items before debiting coins", async () => {
  const Items = { findOne: () => ({ lean: async () => null }) };
  const Users = { findOneAndUpdate: () => assert.fail("Unexpected balance update") };
  const { purchase } = createShopService({ Items, Users });
  for (const input of [null, [], {}, { itemId: "broken" }, { itemId: { $ne: null } }, { itemId: item._id, price: 0 }]) {
    await assert.rejects(purchase("player", input), { status: 400, code: "INVALID_ITEM" });
  }
  await assert.rejects(purchase("player", { itemId: item._id }), { status: 404, code: "ITEM_NOT_FOUND" });
});

test("distinguishes ownership and insufficient balance when the guard loses", async () => {
  for (const [state, code] of [
    [{ coins: 0, inventory: [item._id] }, "ITEM_ALREADY_OWNED"],
    [{ coins: item.price - 1, inventory: [] }, "INSUFFICIENT_COINS"],
  ]) {
    const Users = { findOneAndUpdate: async () => null, findById: () => ({ select: () => ({ lean: async () => state }) }) };
    const { purchase } = createShopService({ Items: items, Users });
    await assert.rejects(purchase("player", { itemId: item._id }), { status: 409, code });
  }
});
