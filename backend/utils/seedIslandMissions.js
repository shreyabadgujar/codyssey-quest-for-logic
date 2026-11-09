require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const Mission = require("../models/Mission");
const Island = require("../models/Island");
const { getClient } = require("../services/judge0Service");
const { validateReferences, isValidated } = require("../services/missionValidationService");

async function main() {
  const slug = process.argv[2];
  if (!/^[a-z]+(?:-[a-z]+)+$/.test(slug || "") || slug === "array-archipelago") {
    throw new Error("Usage: node utils/seedIslandMissions.js <expansion-island-slug>");
  }
  const { island, missions } = require(path.join(__dirname, "../data", slug));
  if (island.slug !== slug || missions.length !== 5) throw new Error("Island metadata mismatch");
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([Mission.init(), Island.init()]);
  const existing = await Island.findOne({ slug }).lean();
  const stored = existing ? await Mission.find({ island: existing._id })
    .select("+hiddenTestCases +referenceSolutions +executionLimits +validator +validation").lean() : [];
  if (stored.some(mission => mission.level > 5 || mission.slug !== slug + "-" + mission.level)) {
    throw new Error("Island already has other mission records. Review them before publishing.");
  }

  async function validate(mission) {
    const prior = stored.find(item => item.level === mission.level);
    const candidate = { ...mission, validation: prior?.validation };
    console.log("Validating Q" + mission.level + ": " + mission.title);
    const validation = isValidated(candidate) ? prior.validation : await validateReferences(mission, getClient().execute);
    console.log("Passed Q" + mission.level + " in " + validation.languages.join(", "));
    return validation;
  }
  const approvals = [];
  // Bound parallel reference validation. Each solution still runs its tests sequentially.
  for (let start = 0; start < missions.length; start += 2) {
    approvals.push(...await Promise.all(missions.slice(start, start + 2).map(validate)));
  }

  const report = await mongoose.connection.transaction(async session => {
    const document = await Island.findOneAndUpdate({ slug }, { $set: island }, { upsert: true, new: true, session });
    const rows = [];
    for (const [index, mission] of missions.entries()) {
      const record = await Mission.findOneAndUpdate({ island: document._id, level: mission.level },
        { $set: { ...mission, island: document._id, validation: approvals[index] } },
        { new: true, upsert: true, runValidators: true, session });
      rows.push({ level: mission.level, id: String(record._id), title: mission.title, status: "passed",
        languages: approvals[index].languages, testsPerLanguage: mission.sampleTestCases.length + mission.hiddenTestCases.length });
    }
    return rows;
  });
  const folder = path.join(__dirname, "../validation");
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, slug + "-report.json"), JSON.stringify({ island: slug, missions: report }, null, 2) + "\n");
  console.log("Published all five missions for " + island.name);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
