const app = require("./app");
const connectDB = require("./config/db");
const { port, mongoUri } = require("./config/env");
const { seedShop } = require("./services/shopService");
const { seedAchievements } = require("./services/achievementService");

const PuzzleSession = require("./models/PuzzleSession");

(async () => {
  try {
    await connectDB();
    if (mongoUri) await Promise.all([seedShop(), seedAchievements(), PuzzleSession.createIndexes()]);
  } catch (err) {
    console.error("[db] initialization failed:", err.message);
    process.exit(1);
  }
  app.listen(port, () => console.log(`[api] listening on http://localhost:${port}`));
})();
