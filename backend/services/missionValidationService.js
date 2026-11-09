const { createHash } = require("node:crypto");
const { VALIDATOR_VERSION } = require("./outputValidators");
const { evaluate } = require("./evaluationService");
const { DEFAULT_LIMITS } = require("./judge0Service");
const LANGUAGES = ["cpp", "java", "python"];
function fingerprint(mission) {
  const tests = (items) => (items || []).map(({ input, expectedOutput }) => ({ input, expectedOutput }));
  return createHash("sha256").update(JSON.stringify({
    description: mission.description, inputFormat: mission.inputFormat, outputFormat: mission.outputFormat,
    constraints: mission.constraints, samples: tests(mission.sampleTestCases), hidden: tests(mission.hiddenTestCases),
    validator: mission.validator || "exact", validatorVersion: VALIDATOR_VERSION,
    limits: mission.executionLimits || DEFAULT_LIMITS,
    references: LANGUAGES.map((language) => mission.referenceSolutions?.[language]),
  })).digest("hex");
}
function isValidated(mission) {
  return Boolean(mission.hiddenTestCases?.length && mission.sampleTestCases?.length &&
    mission.validation?.fingerprint === fingerprint(mission) &&
    LANGUAGES.every((language) => mission.validation.languages?.includes(language)));
}
async function validateReferences(mission, execute) {
  if (!mission.sampleTestCases?.length || !mission.hiddenTestCases?.length) throw new Error("Samples and hidden tests required");
  const results = {};
  for (const language of LANGUAGES) {
    const code = mission.referenceSolutions?.[language];
    if (typeof code !== "string" || !code.trim()) throw new Error(`Missing ${language} reference`);
    results[language] = await evaluate({ code, language, execute,
      tests: [...mission.sampleTestCases, ...mission.hiddenTestCases].map((test) => ({ input: test.input, expectedOutput: test.expectedOutput, hidden: true })),
      limits: mission.executionLimits, validator: mission.validator,
    });
    if (!results[language].passed) throw new Error(`Reference failed: ${language}: ${results[language].verdict}`);
  }
  return { fingerprint: fingerprint(mission), languages: LANGUAGES, validatedAt: new Date() };
}
module.exports = { fingerprint, isValidated, validateReferences, LANGUAGES };
