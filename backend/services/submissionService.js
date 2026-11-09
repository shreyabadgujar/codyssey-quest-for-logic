const { randomUUID } = require("node:crypto");
const Mission = require("../models/Mission");
const SubmissionLease = require("../models/SubmissionLease");
const { assertUnlocked, recordIncorrectSubmission } = require("./progressService");
const { grantCompletion } = require("./rewardService");
const { getClient, DEFAULT_IDS } = require("./judge0Service");
const { evaluate, INTERNAL } = require("./evaluationService");
const { isValidated } = require("./missionValidationService");
const fail = (message, status = 400, code = "INVALID_SUBMISSION") => Object.assign(new Error(message), { status, code });
const incorrectVerdicts = new Set(["Wrong Answer", "Compilation Error", "Runtime Error", "Time Limit Exceeded"]);
function validateRequest(body, run = false) {
  const allowed = run ? ["missionId", "language", "code", "input"] : ["missionId", "language", "code"];
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((key) => !allowed.includes(key))) throw fail("Unexpected submission fields");
  if (typeof body.missionId !== "string" || !/^[a-fA-F0-9]{24}$/.test(body.missionId)) throw fail("Invalid mission ID");
  if (typeof body.language !== "string" || !Object.hasOwn(DEFAULT_IDS, body.language)) throw fail("Unsupported language");
  if (typeof body.code !== "string" || !body.code.trim() || Buffer.byteLength(body.code) > 65536) throw fail("Code must contain 1–65536 bytes");
  if (Object.hasOwn(body, "input") && (typeof body.input !== "string" || Buffer.byteLength(body.input) > 16384)) throw fail("Custom input must be at most 16384 bytes");
}
function createSubmissionService({ MissionModel = Mission, LeaseModel = SubmissionLease,
  checkUnlocked = assertUnlocked, award = grantCompletion, judge = () => getClient().execute,
  validationCheck = isValidated, recordIncorrect = recordIncorrectSubmission } = {}) {
return async function submit(user, body, run = false) {
  validateRequest(body, run);
  const mission = await MissionModel.findById(body.missionId)
    .select("+hiddenTestCases +storyClue +hiddenObject +validator +executionLimits +referenceSolutions +validation").lean();
  if (!mission) throw fail("Mission not found", 404, "MISSION_NOT_FOUND");
  await checkUnlocked(user, mission);
  if (!validationCheck(mission)) throw fail("This mission is awaiting reference-solution validation", 503, "MISSION_NOT_VALIDATED");
  const owner = randomUUID();
  try {
    await LeaseModel.findOneAndUpdate({ _id: user, expiresAt: { $lte: new Date() } },
      { $set: { owner, expiresAt: new Date(Date.now() + 600000) } }, { upsert: true });
  } catch (error) {
    if (error.code === 11000) throw fail("An evaluation is already running for this account", 409, "SUBMISSION_BUSY");
    throw error;
  }
  try {
    const custom = run && Object.hasOwn(body, "input");
    const tests = custom ? [{ input: body.input, hidden: false }] : [
      ...mission.sampleTestCases.map((test) => ({ ...test, hidden: false })),
      ...(run ? [] : mission.hiddenTestCases.map((test) => ({ ...test, hidden: true }))),
    ];
    const result = await evaluate({ code: body.code, language: body.language, tests, custom,
      limits: mission.executionLimits, validator: mission.validator, execute: judge() });
    if (!run && incorrectVerdicts.has(result.verdict)) {
      await recordIncorrect(user, mission);
    }
    if (!run && result.passed) {
      try {
        result.rewards = await award(user, mission, body.language, owner);
        result.clue = mission.storyClue;
        result.hiddenObject = mission.hiddenObject;
      } catch {
        return { verdict: INTERNAL, passed: false, results: [], message: "Could not confirm completion. Retry safely; rewards are granted once." };
      }
    }
    return result;
  } finally {
    await LeaseModel.deleteOne({ _id: user, owner });
  }
};
}
module.exports = { submit: createSubmissionService(), validateRequest, createSubmissionService };
