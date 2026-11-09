const { test } = require("node:test");
const assert = require("node:assert/strict");
const { evaluate, executionVerdict, INTERNAL } = require("../services/evaluationService");
const { normalize, validators } = require("../services/outputValidators");
const { validateRequest } = require("../services/submissionService");
const { fingerprint, isValidated, validateReferences } = require("../services/missionValidationService");
const ok = (stdout) => ({ status: { id: 3 }, exit_code: 0, stdout });
const base = { code: "solution", language: "cpp", tests: [{ input: "1", expectedOutput: "answer" }] };

test("normalization preserves meaningful whitespace and line structure", () => {
  assert.equal(normalize("a  \r\nb\t\r\n"), "a\nb");
  for (const actual of ["", "ans", "extra answer", "answer extra", " answer", "ans wer", "ANSWER"]) {
    assert.equal(validators.exact({ actual, expected: "answer" }), false);
  }
  assert.equal(validators.exact({ actual: "a\n\nb", expected: "a\nb" }), false);
  assert.equal(validators.unorderedLines({ actual: "b\na", expected: "a\nb" }), true);
  assert.equal(validators.unorderedLines({ actual: "a\na", expected: "a" }), false);
});
test("all required tests must pass, sequentially", async () => {
  const seen = [];
  const result = await evaluate({ ...base, tests: [{ input: "a", expectedOutput: "a" }, { input: "b", expectedOutput: "b", hidden: true }],
    execute: async ({ input }) => { seen.push(input); return ok(input); } });
  assert.equal(result.passed, true);
  assert.deepEqual(seen, ["a", "b"]);
  assert.equal(result.results[1].stdout, undefined);
});
test("wrong answers, empty output, malformed results and judge exceptions fail closed", async () => {
  for (const stdout of ["", null, "wrong"]) {
    const result = await evaluate({ ...base, execute: async () => ok(stdout) });
    assert.equal(result.verdict, "Wrong Answer");
    assert.equal(result.passed, false);
  }
  for (const execute of [async () => undefined, async () => ok(undefined), async () => { throw new Error("secret"); }]) {
    assert.equal((await evaluate({ ...base, execute })).verdict, INTERNAL);
  }
  for (const tests of [[], undefined, [{ input: "1" }]]) {
    assert.equal((await evaluate({ ...base, tests, execute: async () => ok("") })).verdict, INTERNAL);
  }
  assert.equal((await evaluate({ ...base, validator: "toString", execute: async () => ok("answer") })).verdict, INTERNAL);
});
test("status mapping never accepts infrastructure failures", () => {
  for (const id of [undefined, 0, 1, 2, 13, 99]) assert.equal(executionVerdict({ status: { id } }), INTERNAL);
  assert.equal(executionVerdict({ status: { id: 6 } }), "Compilation Error");
  assert.equal(executionVerdict({ status: { id: 5 } }), "Time Limit Exceeded");
  for (const id of [7, 8, 9, 10, 11, 12, 14]) assert.equal(executionVerdict({ status: { id } }), "Runtime Error");
  assert.equal(executionVerdict({ ...ok(""), exit_code: 1 }), INTERNAL);
});
test("hidden stdout, stderr and compiler output cannot exfiltrate inputs", async () => {
  for (const id of [3, 5, 6, 11, 13]) {
    const result = await evaluate({ ...base, tests: [{ input: "SECRET", expectedOutput: "x", hidden: true }],
      execute: async () => ({ ...ok("SECRET"), status: { id }, stderr: "SECRET", compile_output: "SECRET" }) });
    assert.equal(JSON.stringify(result).includes("SECRET"), false);
  }
});
test("custom runs execute but are not accepted completions", async () => {
  const result = await evaluate({ ...base, custom: true, tests: [{ input: "" }], execute: async () => ok("anything") });
  assert.equal(result.verdict, "Executed");
  assert.equal(result.passed, false);
});
test("request rejects reward/verdict injection, unknown languages and oversized code", () => {
  const request = { missionId: "a".repeat(24), language: "cpp", code: "int main() {}" };
  validateRequest(request);
  for (const field of ["xp", "coins", "verdict", "expectedOutput", "language_id", "tests", "limits"]) {
    assert.throws(() => validateRequest({ ...request, [field]: 1 }));
  }
  for (const code of ["", "  ", null, "é".repeat(40000)]) assert.throws(() => validateRequest({ ...request, code }));
  for (const language of ["javascript", "__proto__", 54]) assert.throws(() => validateRequest({ ...request, language }));
  assert.throws(() => validateRequest({ ...request, input: "x" }));
  validateRequest({ ...request, input: "" }, true);
});
test("validation requires every language and changing suite revokes approval", async () => {
  const mission = { description: "Find answer", sampleTestCases: base.tests, hiddenTestCases: base.tests,
    referenceSolutions: { c: "c", cpp: "cpp", java: "java", python: "python" } };
  const calls = [];
  mission.validation = await validateReferences(mission, async ({ language }) => { calls.push(language); return ok("answer"); });
  assert.equal(calls.length, 6);
  assert.equal(isValidated(mission), true);
  const old = fingerprint(mission);
  mission.hiddenTestCases = [{ input: "2", expectedOutput: "new" }];
  assert.notEqual(fingerprint(mission), old);
  assert.equal(isValidated(mission), false);
  await assert.rejects(validateReferences(mission, async () => ok("wrong")));
});
test("private mission fields excluded by default schema selection", () => {
  const Mission = require("../models/Mission");
  for (const field of ["hiddenTestCases", "referenceSolutions", "storyClue", "hiddenObject", "validation", "executionLimits", "validator"]) {
    assert.equal(Mission.schema.path(field).options.select, false);
  }
});
