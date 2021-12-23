let express = require("express");

const db = require("../db.js");
const mongoose = require('mongoose')

router = express.Router();


router.get("/:_id?", async (req,res) => {
    if (!req.user) { //if you arent logged in err
        res.status(401).render("error", {code: 401, description: "You must be logged in to perform this action."});
        return;
    } else if (!(req.user.roles.includes("board")) && req.params._id && req.user._id != req.params._id) { //if you are not board, you requested a specific id, and that id isnt you, err
        res.status(403).render("error", {code: 403, description: "Unauthorized for logged in user."});
        return;
    }

    let profile = await (await db.getUserModel()).findOne({_id: new mongoose.Types.ObjectId(req.params._id || req.user._id)});
    profile.name.first = profile.name.first.split(" ").map(x => x ? x[0].toUpperCase() + x.slice(1) : "").join(" "); //make names pretty
    profile.name.last = profile.name.last.split(" ").map(x => x ? x[0].toUpperCase() + x.slice(1) : "").join(" ");
    
    let parents = await (await db.getUserModel()).find({children: String(profile._id)}).exec();
    for (let parent of parents) {
        parent.name.first = parent.name.first.split(" ").map(x => x ? x[0].toUpperCase() + x.slice(1) : "").join(" "); //make names pretty
        parent.name.last = parent.name.last.split(" ").map(x => x ? x[0].toUpperCase() + x.slice(1) : "").join(" ");
    }

    let children = await (await db.getUserModel()).find({_id: {$in: profile.children.map(x=>mongoose.Types.ObjectId(x))}}).exec();

    for (let child of children) {
        child.name.first = child.name.first.split(" ").map(x => x ? x[0].toUpperCase() + x.slice(1) : "").join(" "); //make names pretty
        child.name.last = child.name.last.split(" ").map(x => x ? x[0].toUpperCase() + x.slice(1) : "").join(" ");
    }

    res.render("profile", {user: req.user, profile, parents, children});
})

/* profile information update */
router.post("/:_id?/update", async (req,res) => {
    if (!req.user) { //if you arent logged in err
        res.status(401).render("error", {code: 401, description: "You must be logged in to perform this action."});
        return;
    } else if (!(req.user.roles.includes("board")) && req.params._id && req.user._id != req.params._id) { //if you are not board, you requested a specific id, and that id isnt you, err
        res.status(403).render("error", {code: 403, description: "Unauthorized for logged in user."});
        return;
    }
    //use the information in req.body to update the document
    if ((await (await db.getUserModel()).updateOne({_id: new mongoose.Types.ObjectId(req.params._id || req.user._id)}, 
        {$set: {
            name: {
                first: req.body.firstName.toLowerCase(),
                last: req.body.lastName.toLowerCase()
            }
        }}
    )).modifiedCount != 0) { //check the number of documents modified (1+=worked, 0=didnt work) and send that information to the client
        res.json(true);
    } else {
        res.json(false);
    }
})

router.post("/:_id?/removeParent", async (req,res) => {
    if (!req.user) { //if you arent logged in err
        res.status(401).render("error", {code: 401, description: "You must be logged in to perform this action."});
        return;
    } else if (!(req.user.roles.includes("board")) && req.params._id && req.user._id != req.params._id) { //if you are not board, you requested a specific id, and that id isnt you, err
        res.status(403).render("error", {code: 403, description: "Unauthorized for logged in user."});
        return;
    }
    if ((await (await db.getUserModel()).updateOne({_id: new mongoose.Types.ObjectId(req.body._id)}, //remove the child's id from the parent's children array
        {$pull: {
            children: String(req.params._id || req.user._id)
        }}
    )).modifiedCount != 0) { //check the number of documents modified (1+=worked, 0=didnt work) and send that information to the client
        res.json(true);
    } else {
        res.json(false);
    }
});

router.post("/:_id?/addParent", async (req,res) => {
    if (!req.user) { //if you arent logged in err
        res.status(401).render("error", {code: 401, description: "You must be logged in to perform this action."});
        return;
    } else if (!(req.user.roles.includes("board")) && req.params._id && req.user._id != req.params._id) { //if you are not board, you requested a specific id, and that id isnt you, err
        res.status(403).render("error", {code: 403, description: "Unauthorized for logged in user."});
        return;
    }
    if ((await (await db.getUserModel()).updateOne({email: req.body.email, roles: "parent"}, //find the parent by email and add the child's id to their children array
        {$push: {
            children: String(req.params._id || req.user._id)
        }}
    )).modifiedCount != 0) { //check the number of documents modified (1+=worked, 0=didnt work) and send that information to the client
        res.json(true);
    } else {
        res.json(false);
    }
});
module.exports = router;