let express = require("express");

const db = require("../db.js");
const mongoose = require('mongoose')

router = express.Router();


router.get("/allsummaries", async (req,res) => {
    if (!req.user) { //must be logged in to see a tutee's data
        res.status(401).render("error", {code: 401, description: "You must be logged in to perform this action."});
        return;
    } else if (!(req.user.roles.includes("board"))) { //if you are not a board member, you cannot access this data
        res.status(403).render("error", {code: 403, description: "Unauthorized for logged in user."});
        return;
    }

    //only auth'd users are past this point
    let sessionData = await (await db.getSessionModel()).find({}).sort({date: -1}).limit(100).exec();
    res.render("allsummaries", {user: req.user, summaries: sessionData});
});

router.get("/addtutor", async (req,res) => {
    if (!req.user) { //must be logged in to see a tutee's data
        res.status(401).render("error", {code: 401, description: "You must be logged in to perform this action."});
        return;
    } else if (!(req.user.roles.includes("board"))) { //if you are not a board member, you cannot access this data
        res.status(403).render("error", {code: 403, description: "Unauthorized for logged in user."});
        return;
    }

    res.render("addtutor", {user: req.user});
});

router.post("/addtutor", async (req, res) => {
    let formData = req.body;
    await getOrMakeTutor(null, formData["tutor-email"].toLowerCase(), null, null, null);
    res.render("addtutor", { user: req.user});
    res.status(201);
});

router.get("/managetutor", async (req,res) => {
    if (!req.user) { //must be logged in to see a tutee's data
        res.status(401).render("error", {code: 401, description: "You must be logged in to perform this action."});
        return;
    } else if (!(req.user.roles.includes("board"))) { //if you are not a board member, you cannot access this data
        res.status(403).render("error", {code: 403, description: "Unauthorized for logged in user."});
        return;
    }

    res.render("managetutor", {user: req.user});
});

router.post("/managetutor", async (req, res) => {
    if (!req.user) { //must be logged in to see a tutee's data
        res.status(401).render("error", {code: 401, description: "You must be logged in to perform this action."});
        return;
    } else if (!(req.user.roles.includes("board"))) { //if you are not a board member, you cannot access this data
        res.status(403).render("error", {code: 403, description: "Unauthorized for logged in user."});
        return;
    }
});
router.post("/managetutor/findtutor", async (req, res) => {
    if (!req.user) { //must be logged in
        res.status(401).render("error", {code: 401, description: "You must be logged in to perform this action."});
        return;
    } else if (!(req.user.roles.includes("board"))) { //if you are not a board member, you cannot access this data
        res.status(403).render("error", {code: 403, description: "Unauthorized for logged in user."});
        return;
    }
    if(req.user.email == req.body.email){ //cannnot change own roles
        res.json({querySuccess: false, errorType: 1});
    } else{
        let user = await (await db.getUserModel()).findOne({"email": req.body["email"]})
        if(user){
            res.json({querySuccess: true, errorType: null, user: user});
        } else {
            res.json({querySuccess: false, errorType: 2});
        }
        
    }
})

router.post("/managetutor/edittutor", async (req, res) => {
    if (!req.user) { //must be logged in
        res.status(401).render("error", {code: 401, description: "You must be logged in to perform this action."});
        return;
    } else if (!(req.user.roles.includes("board"))) { //if you are not a board member, you cannot access this data
        res.status(403).render("error", {code: 403, description: "Unauthorized for logged in user."});
        return;
    }
    //prevent adding of existing roles
    if((await (await db.getUserModel()).updateOne({_id: mongoose.Types.ObjectId(req.body._id)}, {$set: {roles: req.body.roles}})).modifiedCount != 0){
        res.json(true);
    } else {
        res.json(false);
    }
    
})
/**
 * Return + update a user if match in database otherwise make a new user, add it to the database and return it
Matching priority:
1. google_sub
2. email
3. name (first and last)
 */
async function getOrMakeTutor(google_sub, email, given_name, family_name, grad_year) {
    // let isNew = false;
    if (google_sub) var user = await (await db.getUserModel()).findOne({google_sub: google_sub}); //see if a user exists with their google account
    if (!user) user = await (await db.getUserModel()).findOne({email: email, google_sub: null}); //see if a user exists with their email
    if (!user) user = await (await db.getUserModel()).findOne({name: {first: given_name, last: family_name}, google_sub: null}); //see if a user exists with their name
    if (!user) { //we are certain the user doesn't exist yet, let's make them from scratch
        user = new (await db.getUserModel())({
            // _id generated when .insertOne is called with _id undefined
            name: {
                first: given_name,
                last: family_name
            },
            email: email,
            google_sub: google_sub,
            roles: ["tutor"],
            children: [],
            grad_year: grad_year
        });
        await user.save(); // insert the user into the collection
        // isNew = true;
    } else {
        Object.assign(user, { //update the user if we got any new information (this could probably be done a better way)
            name: {
                first: given_name,
                last: family_name
            },
            email: email,
            google_sub: google_sub
        });
        user.roles.push("tutor");
        await (await db.getUserModel()).replaceOne({_id: user._id}, user, {upsert: true}) // replace the user with the updated version
    }
    return user //return the user (either newly made or updated) // {user: user, isNew: isNew}; // return the user (either newly made or updated) and if user was new
}

module.exports = router;