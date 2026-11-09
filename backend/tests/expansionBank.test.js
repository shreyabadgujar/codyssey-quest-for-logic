const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { Types } = require("mongoose");
const Mission = require("../models/Mission");
const Island = require("../models/Island");

const folder = path.resolve(__dirname, "../data");
const banks = fs.readdirSync(folder).filter(name => /^[a-z]+(?:-[a-z]+)+\.js$/.test(name));
test("expansion banks fit the shared schema and use unique mission and clue IDs", () => {
  const slugs = new Set();
  const clues = new Set();
  for (const file of banks) {
    const { island, missions } = require(path.join(folder, file));
    assert.equal(new Island(island).validateSync(), undefined);
    assert.equal(island.slug + ".js", file);
    assert.equal(missions.length, 5);
    assert.deepEqual(missions.map(mission => mission.level), [1, 2, 3, 4, 5]);
    assert.deepEqual(missions.map(mission => mission.difficulty),
      ["apprentice", "apprentice", "journeyman", "journeyman", "master"]);
    for (const mission of missions) {
      assert.equal(new Mission({ ...mission, island: new Types.ObjectId() }).validateSync(), undefined);
      assert.ok(!slugs.has(mission.slug));
      assert.ok(!clues.has(mission.storyClue));
      slugs.add(mission.slug);
      clues.add(mission.storyClue);
      for (const key of ["introduction", "inputFormat", "outputFormat", "constraints"]) {
        assert.ok(mission[key]?.trim(), mission.slug + " " + key);
      }
      assert.equal(mission.hints.length, 3);
      assert.ok(Object.values(mission.editorial).every(value => value.trim()));
      assert.ok(mission.sampleTestCases.length >= 2);
      assert.ok(mission.sampleTestCases.every(item => item.explanation?.trim()));
      assert.ok(mission.hiddenTestCases.length >= 3);
      for (const language of ["cpp", "java", "python"]) {
        assert.ok(mission.referenceSolutions[language]?.trim());
        assert.ok(mission.starterCode[language]?.trim());
      }
    }
  }
});
