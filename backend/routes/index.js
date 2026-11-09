const router = require("express").Router();

router.get("/health", (req, res) => res.json({ data: { status: "ok", service: "codyssey-api" } }));

router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/islands", require("./islandRoutes"));
router.use("/missions", require("./missionRoutes"));
router.use("/submissions", require("./submissionRoutes"));
router.use("/shop", require("./shopRoutes"));
router.use("/achievements", require("./achievementRoutes"));

router.use("/puzzles", require("./puzzleRoutes"));

module.exports = router;
