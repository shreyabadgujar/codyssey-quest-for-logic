const limits = { cpu: 4, wall: 15, memory: 262144 };

function program(language, body) {
  if (language === "cpp") return '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n' + body + '\n}\n';
  if (language === "java") return 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n' + body + '\n    }\n}\n';
  return 'import sys\n\n' + body + '\n';
}

function makeBank(island, specs) {
  if (specs.length !== 5) throw new Error("Each expansion island requires five missions");
  const missions = specs.map((spec, index) => {
    const level = index + 1;
    const stage = level < 3 ? "Explorer" : level < 5 ? "Detective" : "Mastermind";
    const difficulty = level < 3 ? "apprentice" : level < 5 ? "journeyman" : "master";
    const sampleTestCases = spec.samples.map(([input, expectedOutput, explanation]) => {
      if (spec.oracle(input).trimEnd() !== expectedOutput.trimEnd()) {
        throw new Error(island.slug + " sample mismatch in Q" + level);
      }
      return { input, expectedOutput, explanation };
    });
    const hiddenTestCases = spec.hidden.map(entry => {
      const [input, expectedOutput] = typeof entry === "string" ? [entry, spec.oracle(entry)] : entry;
      return { input, expectedOutput };
    });
    const languages = ["cpp", "java", "python"];
    const wrap = (key) => Object.fromEntries(languages.map((lang, i) => [lang, program(lang, spec[key][i])]));
    return {
      level, slug: island.slug + "-" + level, stage, difficulty,
      title: spec.title, introduction: spec.intro, description: spec.statement,
      inputFormat: spec.input, outputFormat: spec.output, constraints: spec.constraints,
      hints: spec.hints, editorial: { explanation: spec.editorial, timeComplexity: spec.time, spaceComplexity: spec.space },
      sampleTestCases, hiddenTestCases, starterCode: wrap("starter"), referenceSolutions: wrap("reference"),
      xpReward: 40 + level * 15, coinReward: 15 + level * 7,
      storyClue: spec.clue,
      hiddenObject: { name: spec.treasure, asset: "/assets/decorations/wax-seal.webp", position: { x: 14 + 14 * level, y: 38 + 8 * (level % 3) } },
      validator: "exact", executionLimits: limits,
    };
  });
  return { island: { ...island, totalLevels: 5 }, missions };
}
module.exports = { makeBank };
