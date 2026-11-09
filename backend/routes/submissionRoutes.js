const router = require("express").Router();
const c = require("../controllers/submissionController");
const auth = require("../middleware/auth");

const rateLimit = require("express-rate-limit");
router.use(auth);
router.use(rateLimit({ windowMs: 60000, limit: 10, keyGenerator: (req) => String(req.user._id),
  message: { error: { message: "Too many evaluations. Try again shortly.", code: "RATE_LIMITED" } },
}));
router.post("/run", c.run);
router.post("/", c.create);
module.exports = router;
