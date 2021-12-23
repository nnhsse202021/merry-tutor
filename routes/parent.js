let express = require("express");

const db = require("../db.js");

router = express.Router();


router.get("/mytuteesummaries", async (req,res) => {
    if (!req.user) { //must be logged in to see a tutee's data
        res.status(401).render("error", {code: 401, description: "You must be logged in to perform this action."});
        return;
    } else if (!(req.user.roles.includes("parent")) && req.user._id != req.params._id) { //if you are a parent of the id you are fine, otherwise your id must match this tutee
        res.status(403).render("error", {code: 403, description: "Unauthorized for logged in user."});
        return;
    }

    //only auth'd users are past this point
    let parent = req.user
    let sessionData = await (await db.getSessionModel()).find({"tutee.id": {$in: parent.children}}).sort({date: -1}).limit(100).exec();
    res.render("mytuteesummaries", {user: req.user, summaries: sessionData});
});

module.exports = router;