require("dotenv").config();
const mongoose = require("mongoose");
const Island = require("../models/Island");
const Mission = require("../models/Mission");
const { banks } = require("../data/hard-missions");
const { getClient } = require("../services/judge0Service");
const { isValidated, validateReferences } = require("../services/missionValidationService");

const privateFields = "+hiddenTestCases +referenceSolutions +executionLimits +validator +validation";
const allMissions = banks.flatMap(bank => bank.missions);
const validationWorkers = 4;

async function validateAll(existing = new Map()) {
  const approvals = new Map();
  const pending = [...allMissions];
  const errors = [];
  async function worker() {
    for (;;) {
      const mission = pending.shift();
      if (!mission) return;
      try {
        const prior = existing.get(mission.slug)?.validation;
        let validation = prior;
        if (!isValidated({ ...mission, validation })) {
          let lastTest;
          const execute = getClient().execute;
          try {
            validation = await validateReferences(mission, request => {
              lastTest = mission.sampleTestCases.findIndex(test => test.input === request.input);
              lastTest = lastTest >= 0 ? "sample " + (lastTest + 1) : "hidden " +
                (mission.hiddenTestCases.findIndex(test => test.input === request.input) + 1);
              return execute(request);
            });
          } catch (error) {
            throw new Error(error.message + (lastTest ? " at " + lastTest : ""));
          }
        }
        approvals.set(mission.slug, validation);
        console.log(mission.slug + " passed " + validation.languages.join(", ") +
          " (" + (mission.sampleTestCases.length + mission.hiddenTestCases.length) + " tests each)");
      } catch (error) {
        errors.push(mission.slug + ": " + error.message);
        console.error(errors.at(-1));
      }
    }
  }
  await Promise.all(Array.from({ length: validationWorkers }, worker));
  if (errors.length) throw new Error(errors.length + " reference suite(s) failed. No missions published.");
  return approvals;
}

async function readExisting(session = null) {
  const stored = new Map();
  for (const { island, missions } of banks) {
    const current = await Island.findOne({ slug: island.slug }).session(session).lean();
    if (!current) throw new Error("Publish the original island first: " + island.slug);
    const original = require("../data/" + island.slug).missions;
    const rows = await Mission.find({ island: current._id }).select(privateFields).session(session).lean();
    const byLevel = new Map(rows.map(row => [row.level, row]));
    if (original.some(mission => byLevel.get(mission.level)?.slug !== mission.slug) ||
      rows.some(row => row.level > island.totalLevels || row.level < 1)) {
      throw new Error("Unexpected existing records for " + island.slug);
    }
    for (const mission of missions) {
      const row = byLevel.get(mission.level);
      if (!row) continue;
      if (row.slug !== mission.slug || !isValidated(row) ||
        !isValidated({ ...mission, validation: row.validation })) {
        throw new Error("Existing mission differs at " + mission.slug + "; it was preserved.");
      }
      stored.set(mission.slug, row);
    }
  }
  return stored;
}

async function publish(approvals) {
  return mongoose.connection.transaction(async session => {
    const existing = await readExisting(session);
    let inserted = 0;
    for (const { island, missions } of banks) {
      const current = await Island.findOne({ slug: island.slug }).session(session).lean();
      const additions = missions.filter(mission => !existing.has(mission.slug));
      for (const mission of additions) {
        if (!isValidated({ ...mission, validation: approvals.get(mission.slug) })) {
          throw new Error("Unvalidated mission: " + mission.slug);
        }
      }
      if (additions.length) {
        await Mission.insertMany(additions.map(mission => ({
          ...mission, island: current._id, validation: approvals.get(mission.slug),
        })), { session });
      }
      await Island.updateOne({ _id: current._id, totalLevels: { $lt: island.totalLevels } },
        { $set: { totalLevels: island.totalLevels } }, { session });
      inserted += additions.length;
    }
    return inserted;
  });
}

async function main() {
  const args = process.argv.slice(2);
  const shouldPublish = args[0] === "--publish";
  if (args.length > 1 || (args.length && !shouldPublish)) throw new Error("Usage: node utils/seedHardMissions.js [--publish]");
  if (shouldPublish) {
    await mongoose.connect(process.env.MONGODB_URI);
    await Promise.all([Mission.init(), Island.init()]);
  }
  const existing = shouldPublish ? await readExisting() : new Map();
  const approvals = await validateAll(existing);
  if (shouldPublish) {
    const inserted = await publish(approvals);
    console.log("Published " + inserted + " new missions; " + (allMissions.length - inserted) + " were already published.");
  } else {
    console.log("Validated " + approvals.size + " missions. Use --publish to append the expansion.");
  }
}
main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
