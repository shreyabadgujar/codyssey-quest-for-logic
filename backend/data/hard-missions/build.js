const { makeBank } = require("../missionBank");

function build(slug, specs) {
  const { island } = require("../" + slug);
  return makeBank(island, specs.map(spec => ({
    ...spec,
    starter: [
      '    vector<string> tokens;\n    for (string token; cin >> token;) tokens.push_back(token);\n    // Parse the tokens according to the case file and implement the solution.',
      '        List<String> tokens = new ArrayList<>();\n        for (String word; (word = token()) != null;) tokens.add(word);\n        // Parse the tokens according to the case file and implement the solution.',
      'tokens = sys.stdin.buffer.read().split()\n# Parse the tokens according to the case file and implement the solution.',
    ],
    reference: [spec.cpp, spec.java, "tokens = iter(sys.stdin.buffer.read().split())\nI = lambda: int(next(tokens))\n" + spec.py],
    clue: "The " + spec.treasure + " bears the island's next waypoint.",
  })), 6);
}

const line = values => values.join(" ") + "\n";
const repeat = (n, value) => Array(n).fill(value);
const range = (n, start = 1) => Array.from({ length: n }, (_, i) => i + start);

module.exports = { build, line, repeat, range };
