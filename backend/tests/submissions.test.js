const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createSubmissionService } = require("../services/submissionService");
const request = { missionId: "a".repeat(24), language: "cpp", code: "solution" };
function setup(overrides = {}) {
  let leased = false, awards = 0;
  const inputs = [], incorrect = [];
  const mission = { _id: request.missionId, sampleTestCases: [{ input: "sample", expectedOutput: "yes" }],
    hiddenTestCases: [{ input: "secret", expectedOutput: "yes" }], storyClue: "clue", xpReward: 10, coinReward: 5 };
  const submit = createSubmissionService({
    MissionModel: { findById: () => ({ select: () => ({ lean: async () => mission }) }) },
    LeaseModel: {
      findOneAndUpdate: async () => { if (leased) throw Object.assign(new Error(), { code: 11000 }); leased = true; },
      deleteOne: async () => { leased = false; },
    },
    checkUnlocked: async () => {}, validationCheck: () => true,
    recordIncorrect: async (user, mission) => incorrect.push({ user, mission: mission._id }),
    award: async () => { awards++; return { xp: 10, coins: 5 }; },
    judge: () => async ({ input }) => { inputs.push(input); return { status: { id: 3 }, exit_code: 0, stdout: "yes" }; },
    ...overrides,
  });
  return { submit, inputs, incorrect, awards: () => awards, leased: () => leased };
}
test("Run uses visible/custom cases only and never calls reward service", async () => {
  const state = setup();
  await state.submit("user", request, true);
  assert.deepEqual(state.inputs, ["sample"]);
  await state.submit("user", { ...request, input: "custom" }, true);
  assert.deepEqual(state.inputs, ["sample", "custom"]);
  assert.equal(state.awards(), 0);
  assert.equal(state.incorrect.length, 0);
  assert.equal(state.leased(), false);
});
test("Submit evaluates hidden tests before rewarding", async () => {
  const state = setup();
  const result = await state.submit("user", request);
  assert.deepEqual(state.inputs, ["sample", "secret"]);
  assert.equal(state.awards(), 1);
  assert.equal(result.clue, "clue");
  assert.equal(result.verdict, "Accepted");
});
test("judge outage or incorrect answer never calls reward service", async () => {
  for (const execution of [async () => { throw new Error("outage"); }, async () => ({ status: { id: 3 }, exit_code: 0, stdout: "no" })]) {
    const state = setup({ judge: () => execution });
    const result = await state.submit("user", request);
    assert.equal(result.passed, false);
    assert.equal(state.awards(), 0);
    assert.equal(state.incorrect.length, result.verdict === "Wrong Answer" ? 1 : 0);
    assert.equal(state.leased(), false);
  }
});
test("concurrent requests cannot start a second evaluation", async () => {
  let release, started;
  const start = new Promise((resolve) => { started = resolve; });
  const wait = new Promise((resolve) => { release = resolve; });
  const state = setup({ judge: () => async () => { started(); await wait; return { status: { id: 3 }, exit_code: 0, stdout: "yes" }; } });
  const first = state.submit("user", request);
  await start;
  await assert.rejects(state.submit("user", request), (error) => error.code === "SUBMISSION_BUSY");
  release();
  await first;
  assert.equal(state.awards(), 1);
});
test("unvalidated or locked missions never reach judge", async () => {
  const invalid = setup({ validationCheck: () => false });
  await assert.rejects(invalid.submit("user", request), (error) => error.code === "MISSION_NOT_VALIDATED");
  assert.equal(invalid.inputs.length, 0);
  const locked = setup({ checkUnlocked: async () => { throw new Error("locked"); } });
  await assert.rejects(locked.submit("user", request), /locked/);
  assert.equal(locked.inputs.length, 0);
});
test("failed reward transaction returns internal error and no clue", async () => {
  const state = setup({ award: async () => { throw new Error("database unavailable"); } });
  const result = await state.submit("user", request);
  assert.equal(result.verdict, "Internal Judge Error");
  assert.equal(result.passed, false);
  assert.equal(result.clue, undefined);
});
