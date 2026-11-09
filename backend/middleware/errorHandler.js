const { nodeEnv } = require("../config/env");

exports.notFound = (req, res) =>
  res.status(404).json({ error: { message: "Route not found", code: "NOT_FOUND" } });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({
      error: {
        message: field === "email" ? "An explorer with this email already exists" : "Explorer name is already taken",
        code: "DUPLICATE_KEY",
      },
    });
  }

  const status = err.status || 500;
  if (nodeEnv !== "test") console.error(err);
  res.status(status).json({
    error: { message: status === 500 ? "Internal server error" : err.message, code: err.code || "ERROR" },
  });
};
