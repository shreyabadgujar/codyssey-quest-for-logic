// Placeholder handler for unfinished endpoints. Replace with real logic; do not fake results.
module.exports = (feature) => (req, res) =>
  res.status(501).json({ error: { message: `${feature} not implemented yet`, code: "NOT_IMPLEMENTED" } });
