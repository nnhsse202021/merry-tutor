let express = require("express");

router = express.Router();

router.get("/new", (req,res) => {
    res.render("sessionsummary", {});
});

module.exports = router;