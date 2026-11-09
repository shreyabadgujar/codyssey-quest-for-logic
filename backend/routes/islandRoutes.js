const router = require("express").Router();
const c = require("../controllers/islandController");
const auth = require("../middleware/auth");

router.use(auth);
router.get("/", c.list);
router.get("/:id", c.getOne);
module.exports = router;
