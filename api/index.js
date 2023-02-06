const router = require("express").Router();

// router.use("/businesses", require("./businesses"));
// router.use("/reviews", require("./reviews"));
// router.use("/photos", require("./photos"));
// router.use("/users", require("./users"));

router.use("/recipes", require("./recipes"));
router.use("/photos", require("./photos"));
router.use("/videos", require("./videos"));
router.use("/comments", require("./comments"));
router.use("/stars", require("./stars"));
router.use("/users", require("./users"));

module.exports = router;
