require("dotenv").config();
const mongoose = require("mongoose");
const Mission = require("../models/Mission");
const { getClient } = require("../services/judge0Service");
const { validateReferences, fingerprint } = require("../services/missionValidationService");

(async () => {
  const id = process.argv[2];
  if (!/^[a-fA-F0-9]{24}$/.test(id || "")) throw new Error("Usage: npm run validate:mission -- <mission ObjectId>");
  if (!process.env.JUDGE0_API_URL) throw new Error("Configure JUDGE0_API_URL in backend/.env first");
  await mongoose.connect(process.env.MONGODB_URI);
  const select = "+hiddenTestCases +referenceSolutions +executionLimits +validator +validation";
  const mission = await Mission.findById(id).select(select).lean();
  if (!mission) throw new Error("Mission not found");
  // Clear old approval before validation, including if a later language fails.
  await Mission.updateOne({ _id: id }, { $unset: { validation: 1 } });
  const validation = await validateReferences(mission, getClient().execute);
  const current = await Mission.findById(id).select(select).lean();
  if (fingerprint(current) !== validation.fingerprint) throw new Error("Mission changed while validating; rerun validation");
  await Mission.updateOne({ _id: id }, { $set: { validation } });
  console.log(`Reference suites passed: ${validation.languages.join(", ")}. Independent oracle and performance review remain separate requirements.`);
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
