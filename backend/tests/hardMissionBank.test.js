const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Types } = require("mongoose");
const Mission = require("../models/Mission");
const { banks } = require("../data/hard-missions");
const { missions: arrayMissions } = require("../data/arrayMissions");
const { isValidated } = require("../services/missionValidationService");

test("exactly 27 Hard cases extend the existing catalogue from 60 to 87", () => {
  const slugs = new Set(arrayMissions.map(mission => mission.slug));
  const clues = new Set(arrayMissions.map(mission => mission.storyClue));
  assert.equal(arrayMissions.length, 15);
  assert.equal(banks.length, 9);
  const islands = new Set();
  for (const { island, missions } of banks) {
    assert.notEqual(island.slug, "array-archipelago");
    assert.ok(!islands.has(island.slug));
    islands.add(island.slug);
    const original = require("../data/" + island.slug);
    assert.equal(original.island.totalLevels, 5);
    assert.deepEqual(original.missions.map(mission => mission.level), [1, 2, 3, 4, 5]);
    assert.equal(island.totalLevels, 8);
    assert.deepEqual(missions.map(mission => mission.level), [6, 7, 8]);
    for (const mission of [...original.missions, ...missions]) {
      assert.ok(!slugs.has(mission.slug), mission.slug);
      assert.ok(!clues.has(mission.storyClue), mission.slug);
      slugs.add(mission.slug);
      clues.add(mission.storyClue);
    }
    for (const mission of missions) {
      assert.equal(mission.slug, island.slug + "-" + mission.level);
      assert.equal(mission.difficulty, "master");
      assert.equal(new Mission({ ...mission, island: new Types.ObjectId() }).validateSync(), undefined, mission.slug);
      assert.equal(isValidated(mission), false, "Bank entries require real Judge0 approval");
    }
  }
  assert.equal(slugs.size, 87);
});

test("every new case has complete teaching material and distinct boundary and stress fixtures", () => {
  for (const { missions } of banks) for (const mission of missions) {
    const { slug, sampleTestCases, hiddenTestCases } = mission;
    assert.ok(mission.introduction && mission.description && mission.inputFormat && mission.outputFormat && mission.constraints, slug);
    assert.equal(new Set(mission.hints).size, 3, slug);
    assert.ok(Object.values(mission.editorial).every(value => value.trim()), slug);
    assert.ok(sampleTestCases.length >= 2 && sampleTestCases.every(sample => sample.explanation), slug);
    assert.ok(hiddenTestCases.length >= 3, slug);
    const fixtures = [...sampleTestCases, ...hiddenTestCases];
    assert.equal(new Set(fixtures.map(fixture => fixture.input)).size, fixtures.length, slug);
    for (const fixture of fixtures) {
      assert.ok(Buffer.byteLength(fixture.input) <= 1024 * 1024, slug + " Judge0 input limit");
      assert.ok(Buffer.byteLength(fixture.expectedOutput) < 256 * 1024, slug + " Judge0 output limit");
      assert.ok(fixture.expectedOutput.trim(), slug);
    }
    for (const language of ["cpp", "java", "python"]) {
      assert.ok(mission.referenceSolutions[language].trim(), slug);
      assert.ok(mission.starterCode[language].trim(), slug);
    }
  }
});
