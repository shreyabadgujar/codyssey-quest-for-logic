const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const path = require("node:path");

async function main() {
  const slug = process.argv[2];
  if (!/^[a-z]+(?:-[a-z]+)+$/.test(slug || "") || slug === "array-archipelago") {
    throw new Error("Usage: node utils/checkIslandJourney.js <expansion-island-slug>");
  }
  const { missions } = require(path.join(__dirname, "../data", slug));
  let token;
  async function api(route, body, status = 200) {
    const response = await fetch("http://localhost:5000/api" + route, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await response.json();
    assert.equal(response.status, status, route + ": " + (json.error?.code || response.status));
    return json.data;
  }
  const tag = randomUUID().slice(0, 8);
  const registration = await api("/auth/register",
    { username: "Island QA " + tag, email: tag + "@codyssey-qa.example", password: randomUUID() }, 201);
  token = registration.token;
  const original = await api("/islands/array-archipelago");
  const island = await api("/islands/" + slug);
  assert.equal(island.levels.length, 5);
  assert.deepEqual(island.levels.map(m => m.status), ["unlocked", "locked", "locked", "locked", "locked"]);
  await api("/missions/" + island.levels[1].id, undefined, 403);
  let xp = 0, coins = 0;
  for (const [index, mission] of island.levels.entries()) {
    const detail = await api("/missions/" + mission.id);
    assert.equal(detail.title, missions[index].title);
    assert.ok(detail.description && detail.inputFormat && detail.outputFormat && detail.constraints);
    assert.equal(detail.hints.length, 3);
    assert.ok(detail.sampleTestCases.length >= 2 && detail.sampleTestCases.every(test => test.explanation));
    for (const privateKey of ["referenceSolutions", "hiddenTestCases", "validation", "storyClue", "editorial"]) {
      assert.equal(Object.hasOwn(detail, privateKey), false, privateKey);
    }
    assert.ok((await api("/missions/" + mission.id + "/editorial")).explanation);
    const language = ["cpp", "java", "python"][index % 3];
    const request = { missionId: mission.id, language, code: missions[index].referenceSolutions[language] };
    if (index === 0) {
      const run = await api("/submissions/run", request);
      assert.equal(run.verdict, "Accepted");
      assert.equal(run.rewards, undefined);
      assert.ok(run.results.every(result => !result.hidden));
      const custom = await api("/submissions/run", { ...request, input: detail.sampleTestCases[0].input });
      assert.equal(custom.verdict, "Executed");
      assert.equal(custom.rewards, undefined);
      const profile = await api("/auth/me");
      assert.equal(profile.xp, 0);
      assert.equal(profile.coins, 0);
    }
    const result = await api("/submissions", request);
    assert.equal(result.verdict, "Accepted", mission.title);
    assert.deepEqual(result.rewards, { xp: mission.xp, coins: mission.coins, firstCompletion: true });
    assert.ok(result.clue && result.hiddenObject?.name);
    const hidden = result.results.filter(item => item.hidden);
    assert.equal(hidden.length, missions[index].hiddenTestCases.length);
    assert.ok(hidden.every(item => !Object.hasOwn(item, "stdout") && !Object.hasOwn(item, "stderr")));
    xp += mission.xp;
    coins += mission.coins;
    if (index === 0) {
      const repeat = await api("/submissions", request);
      assert.deepEqual(repeat.rewards, { xp: 0, coins: 0, firstCompletion: false });
    }
    console.log("Passed " + slug + " Q" + (index + 1) + " via the authenticated " + language + " submission route");
  }
  const completed = await api("/islands/" + slug);
  assert.ok(completed.levels.every(item => item.status === "completed"));
  const profile = await api("/auth/me");
  assert.equal(profile.xp, xp);
  assert.equal(profile.coins, coins);
  const after = await api("/islands/array-archipelago");
  assert.deepEqual(after.levels, original.levels);
  console.log("Verified five case files, sequential unlocking, server rewards, duplicate prevention, and independent Array progress");
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
