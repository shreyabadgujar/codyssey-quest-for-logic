const { test } = require("node:test");
const assert = require("node:assert/strict");
const { equipAvatar, equipItem } = require("../services/avatarService");

test("equipping updates only the authenticated user's base avatar", async () => {
  const profile = { avatar: { base: "explorer-04", equipped: { hat: "owned" } }, xp: 500 };
  const model = {
    findByIdAndUpdate: async (id, update, options) => {
      assert.equal(id, "authenticated-player");
      assert.deepEqual(update, { $set: { "avatar.base": "explorer-04" } });
      assert.deepEqual(options, { new: true });
      return profile;
    },
  };
  assert.equal(await equipAvatar("authenticated-player", { base: "explorer-04" }, model), profile);
});

test("unknown avatars and extra fields are rejected before persistence", async () => {
  const model = { findByIdAndUpdate: () => assert.fail("An invalid request must not write") };
  for (const body of [null, [], {}, { base: "explorer-99" }, { base: "/assets/avatars/explorer-01.webp" },
    { base: "explorer-02", xp: 999 }, { base: "explorer-03", user: "another-player" }]) {
    await assert.rejects(equipAvatar("authenticated-player", body, model), { code: "INVALID_AVATAR", status: 400 });
  }
});

const itemId = "636f646573737973686f7001";
const lookup = item => ({ select: () => ({ lean: async () => item }) });

test("equipment replacement checks ownership in the same update and changes only its slot", async () => {
  const profile = { coins: 20, inventory: [itemId], avatar: { base: "explorer-01", equipped: { frame: itemId } } };
  const Items = { findOne: query => {
    assert.deepEqual(query, { _id: itemId, slot: "frame" });
    return lookup({ _id: itemId });
  } };
  const Users = { findOneAndUpdate: async (filter, change, options) => {
    assert.deepEqual(filter, { _id: "player", inventory: itemId });
    assert.deepEqual(change, { $set: { "avatar.equipped.frame": itemId } });
    assert.deepEqual(options, { new: true });
    return profile;
  } };
  assert.equal(await equipItem("player", { slot: "frame", itemId }, { Items, Users }), profile);
});

test("equipment rejects wrong slots, nonowners and injected fields", async () => {
  const Users = { findOneAndUpdate: async () => null };
  const Items = { findOne: query => lookup(query.slot === "frame" ? { _id: itemId } : null) };
  await assert.rejects(equipItem("player", { slot: "frame", itemId }, { Items, Users }), { status: 403, code: "ITEM_NOT_OWNED" });
  await assert.rejects(equipItem("player", { slot: "pin", itemId }, { Items, Users }), { status: 404, code: "EQUIPMENT_NOT_FOUND" });
  await assert.rejects(equipItem("player", { slot: "frame", itemId, coins: 200 }, { Items, Users }), { status: 400 });
  await assert.rejects(equipItem("player", { slot: "frame.other", itemId }, { Items, Users }), { status: 400 });
});

test("unequip unsets only the requested slot", async () => {
  const profile = { coins: 20, inventory: [itemId], avatar: { equipped: {} } };
  const Users = { findByIdAndUpdate: async (id, change, options) => {
    assert.equal(id, "player");
    assert.deepEqual(change, { $unset: { "avatar.equipped.frame": 1 } });
    assert.deepEqual(options, { new: true });
    return profile;
  } };
  assert.equal(await equipItem("player", { slot: "frame", itemId: null }, { Users }), profile);
});
