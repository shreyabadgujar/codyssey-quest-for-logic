const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createRewardService } = require("../services/rewardService");
test("repeated completion awards once, using mission rewards and one transaction", async () => {
  let progress, balance = 0, transactions = 0;
  const session = {};
  const grant = createRewardService({
    connection: { transaction: async (fn) => { transactions++; return fn(session); } },
    LeaseModel: { updateOne: async () => ({ matchedCount: 1 }) },
    ProgressModel: {
      findOne: () => ({ session: async (s) => { assert.equal(s, session); return progress; } }),
      updateOne: async (_, update, options) => { assert.equal(options.session, session); progress = update.$set; },
    },
    UserModel: { updateOne: async (_, update, options) => { assert.equal(options.session, session); balance += update.$inc.coins; return { matchedCount: 1 }; } },
    unlock: async (user, transaction) => {
      assert.equal(user, "user");
      assert.equal(transaction, session);
      assert.equal(progress.status, "completed");
      return [];
    },
  });
  const mission = { _id: "mission", island: "island", xpReward: 100, coinReward: 20 };
  assert.equal((await grant("user", mission, "cpp", "owner")).firstCompletion, true);
  assert.deepEqual(await grant("user", mission, "cpp", "owner"), { xp: 0, coins: 0, firstCompletion: false });
  assert.equal(balance, 20);
  assert.equal(transactions, 2);
});
test("expired lease cannot commit rewards", async () => {
  const grant = createRewardService({ connection: { transaction: (fn) => fn({}) },
    LeaseModel: { updateOne: async () => ({ matchedCount: 0 }) } });
  await assert.rejects(grant("user", { xpReward: 1, coinReward: 1 }, "cpp", "expired"), /lease expired/);
});
