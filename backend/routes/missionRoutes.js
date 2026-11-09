const router = require("express").Router();
const c = require("../controllers/missionController");
const auth = require("../middleware/auth");

router.use(auth);
router.get("/:id", c.getOne);
router.get("/:id/editorial", c.editorial);
router.post("/:id/find-object", c.findObject);
module.exports = router;
