let express = require("express");

router = express.Router();

router.get("/:name", (req,res) => {
    res.render("tutor", {user: req.user, name: req.params.name});
});

module.exports = router;