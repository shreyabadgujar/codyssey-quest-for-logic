function normalize(output) {
  return output.replace(/\r\n?/g, "\n").split("\n")
    .map((line) => line.replace(/[\t ]+$/g, "")).join("\n").replace(/\n+$/g, "");
}
// Trusted server code only. Never evaluate validator source from a request or database.
const validators = Object.freeze({
  exact: ({ actual, expected }) => normalize(actual) === normalize(expected),
  unorderedLines: ({ actual, expected }) => {
    const lines = (value) => normalize(value).split("\n").sort();
    return JSON.stringify(lines(actual)) === JSON.stringify(lines(expected));
  },
});
module.exports = { normalize, validators, VALIDATOR_VERSION: "1" };
