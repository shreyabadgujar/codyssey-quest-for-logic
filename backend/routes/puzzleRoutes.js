const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/puzzleController");
router.use(auth);
router.get("/", c.lobby);
router.get("/:id", c.open);
router.post("/:id/:action", c.act);
module.exports = router;
