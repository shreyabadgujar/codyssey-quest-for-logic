const limits = { cpu: 4, wall: 15, memory: 262144 };

function program(language, body, fast = false) {
  if (language === "cpp") return '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n' + body + '\n}\n';
  if (language === "java" && fast) return `import java.io.*;
import java.util.*;
public class Main {
    static final InputStream in = new BufferedInputStream(System.in);
    static final byte[] buffer = new byte[65536];
    static int size, pos;
    static int read() throws IOException {
        if (size < 0) return -1;
        if (pos == size) {
            size = in.read(buffer);
            pos = 0;
            if (size < 0) return -1;
        }
        return buffer[pos++];
    }
    static String token() throws IOException {
        int c;
        do { c = read(); } while (c >= 0 && c <= 32);
        if (c < 0) return null;
        StringBuilder word = new StringBuilder();
        do { word.append((char)c); c = read(); } while (c > 32);
        return word.toString();
    }
    static long num() throws IOException {
        int c;
        do { c = read(); } while (c >= 0 && c <= 32);
        boolean neg = c == '-';
        if (neg) c = read();
        long value = 0;
        while (c > 32) { value = value * 10 + c - '0'; c = read(); }
        return neg ? -value : value;
    }
    static int integer() throws IOException { return (int)num(); }
    public static void main(String[] args) throws Exception {
` + body + '\n    }\n}\n';
  if (language === "java") return 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n' + body + '\n    }\n}\n';
  return 'import sys\n\n' + body + '\n';
}

function makeBank(island, specs, startLevel = 1) {
  const hard = startLevel === 6;
  if (specs.length !== (hard ? 3 : 5)) throw new Error("Unexpected island mission count");
  const missions = specs.map((spec, index) => {
    const level = index + startLevel;
    const stage = level < 3 ? "Explorer" : level < 5 ? "Detective" : "Mastermind";
    const difficulty = level < 3 ? "apprentice" : level < 5 ? "journeyman" : "master";
    const sampleTestCases = spec.samples.map(([input, expectedOutput, explanation]) => {
      if (spec.oracle && spec.oracle(input).trimEnd() !== expectedOutput.trimEnd()) {
        throw new Error(island.slug + " sample mismatch in Q" + level);
      }
      return { input, expectedOutput, explanation };
    });
    const hiddenTestCases = spec.hidden.map(entry => {
      const [input, expectedOutput] = typeof entry === "string" ? [entry, spec.oracle(entry)] : entry;
      return { input, expectedOutput };
    });
    const languages = ["cpp", "java", "python"];
    const wrap = (key) => Object.fromEntries(languages.map((lang, i) => [lang, program(lang, spec[key][i], hard)]));
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
  return { island: { ...island, totalLevels: startLevel + specs.length - 1 }, missions };
}
module.exports = { makeBank };
