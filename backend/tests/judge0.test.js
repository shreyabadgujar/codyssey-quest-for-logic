const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createJudgeClient, checkedLimits } = require("../services/judge0Service");
const catalog = [{ id: 54, name: "C++ (GCC 9.2.0)" }];
const response = (value, status = 200) => new Response(JSON.stringify(value), { status });
const args = { code: "int main() {}", language: "cpp", input: "secret" };
function client(fetchImpl, extra = {}) {
  return createJudgeClient({ url: "https://judge.example", languageIds: { cpp: 54 }, pause: async () => {}, fetchImpl, ...extra });
}
test("adapter verifies language, submits bounded base64 payload and polls", async () => {
  const calls = [];
  const queue = [catalog, { token: "token-1" }, { status: { id: 2 } }, { status: { id: 3 }, exit_code: 0, stdout: Buffer.from("42\n").toString("base64") }];
  const judge = client(async (url, options) => { calls.push({ url, options }); return response(queue.shift()); });
  const result = await judge.execute(args);
  assert.equal(result.stdout, "42\n");
  const payload = JSON.parse(calls[1].options.body);
  assert.equal(payload.language_id, 54);
  assert.equal(payload.compiler_options, "-std=c++17");
  assert.equal(payload.enable_network, false);
  assert.equal(payload.memory_limit, 262144);
  assert.equal(payload.expected_output, undefined);
  assert.equal(Buffer.from(payload.stdin, "base64").toString(), "secret");
  assert.equal(calls[0].options.redirect, "error");
});
test("unavailable language prevents execution", async () => {
  let calls = 0;
  const judge = client(async () => { calls++; return response([{ id: 54, name: "Bash" }]); });
  await assert.rejects(judge.execute(args));
  assert.equal(calls, 1);
});
test("HTTP errors, network failures and malformed JSON fail closed", async () => {
  for (const fetchImpl of [async () => response({}, 429), async () => response({}, 500),
    async () => { throw new Error("network"); }, async () => new Response("bad json")]) {
    await assert.rejects(client(fetchImpl).execute(args));
  }
});
test("poll timeout and malformed token/output fail closed", async () => {
  for (const ending of [{ status: { id: 1 } }, { status: { id: 3 }, stdout: "***" }]) {
    const queue = [catalog, { token: "token" }, ending];
    await assert.rejects(client(async () => response(queue.shift()), { pollLimit: 1 }).execute(args));
  }
  const queue = [catalog, { token: "../../secret" }];
  await assert.rejects(client(async () => response(queue.shift())).execute(args));
});
test("resource limits and response size are bounded", async () => {
  for (const limits of [{ cpu: 100 }, { memory: 1 }, { wall: 0 }, { cpu: NaN }]) assert.throws(() => checkedLimits(limits));
  await assert.rejects(client(async () => new Response("x".repeat(2100000))).execute(args));
  await assert.rejects(client(async () => response(catalog)).execute({ ...args, deadline: Date.now() - 1 }));
});
