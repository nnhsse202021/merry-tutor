let express = require("express");

router = express.Router();

router.get("/:name", (req,res) => {
    res.render("tutor", {name: req.params.name});
});

module.exports = router;