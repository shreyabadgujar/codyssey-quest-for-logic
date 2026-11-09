const router = require("express").Router();
const c = require("../controllers/shopController");
const auth = require("../middleware/auth");

router.use(auth);
router.get("/items", c.listItems);
router.post("/purchase", c.purchase);
module.exports = router;
