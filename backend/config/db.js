const mongoose = require("mongoose");
const { mongoUri } = require("./env");

// Skips connection (with a warning) when MONGODB_URI is unset so the server can still boot for scaffolding.
module.exports = async function connectDB() {
  if (!mongoUri) {
    console.warn("[db] MONGODB_URI not set — skipping database connection.");
    return;
  }
  await mongoose.connect(mongoUri);
  console.log("[db] connected");
};
