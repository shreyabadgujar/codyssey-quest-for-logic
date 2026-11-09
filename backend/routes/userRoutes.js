const router = require("express").Router();
const c = require("../controllers/userController");
const auth = require("../middleware/auth");

router.use(auth);
router.get("/me", c.getProfile);
router.patch("/me/avatar", c.updateAvatar);
router.post("/me/streak/claim", c.claimStreak);
module.exports = router;
