const { validators } = require("./outputValidators");
const INTERNAL = "Internal Judge Error";
function executionVerdict(result) {
  const id = result?.status?.id;
  if (id === 3) return result.exit_code === 0 && !result.exit_signal ? "Accepted" : INTERNAL;
  if (id === 4) return "Wrong Answer";
  if (id === 5) return "Time Limit Exceeded";
  if (id === 6) return "Compilation Error";
  if ([7, 8, 9, 10, 11, 12, 14].includes(id)) return "Runtime Error";
  return INTERNAL;
}
async function evaluate({ code, language, tests, limits, validator = "exact", execute, custom = false }) {
  const compare = Object.hasOwn(validators, validator) && validators[validator];
  const results = [];
  if (!compare || !Array.isArray(tests) || !tests.length || tests.length > 100) return { verdict: INTERNAL, passed: false, results };
  const deadline = Date.now() + 180000;
  for (const test of tests) {
    let result, verdict;
    try {
      if (Date.now() >= deadline || typeof test.input !== "string" || (!custom && typeof test.expectedOutput !== "string")) throw new Error("Invalid suite");
      result = await execute({ code, language, input: test.input, limits, deadline });
      verdict = executionVerdict(result);
      if (verdict === "Accepted") {
        if (result.stdout !== null && typeof result.stdout !== "string") throw new Error("Invalid output");
        if (!custom && compare({ actual: result.stdout ?? "", expected: test.expectedOutput, input: test.input }) !== true) verdict = "Wrong Answer";
      }
    } catch { verdict = INTERNAL; }
    // Hidden output can echo secret inputs. Suppress stdout, stderr and diagnostics.
    const entry = { verdict, hidden: Boolean(test.hidden) };
    if (!test.hidden && verdict !== INTERNAL) Object.assign(entry, {
      stdout: result?.stdout ?? "", stderr: result?.stderr ?? "", compileOutput: result?.compile_output ?? "",
      time: result?.time ?? null, memory: result?.memory ?? null,
    });
    results.push(entry);
    if (verdict !== "Accepted") return { verdict, passed: false, results };
  }
  return { verdict: custom ? "Executed" : "Accepted", passed: !custom, results };
}
module.exports = { evaluate, executionVerdict, INTERNAL };
