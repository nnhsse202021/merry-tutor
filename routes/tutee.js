let express = require("express");

router = express.Router();

const { MongoClient, ObjectID } = require('mongodb');
const uri = `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.kfvlj.mongodb.net/merry-tutor?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let usersCollection;
let summariesCollection;

mongoClient.connect(err => {
    usersCollection = mongoClient.db("merry-tutor").collection("Users");
    summariesCollection = mongoClient.db("merry-tutor").collection("Summaries");
})


router.get("/:_id", async (req,res) => {
    if (!req.user) { //must be logged in to see a tutee's data
        res.status(401).render("error", {code: 403, description: "You must be logged in to preform this action."});
        return;
    } else if (!(req.user.roles.includes("tutor") || req.user.children.includes(req.params._id)) && req.user._id != req.params._id) { //if you are a tutor or a parent of the id you are fine, otherwise your id must match this tutee
        res.status(403).render("error", {code: 403, description: "Unauthoried for logged in user."});
        return;
    }

    //only auth'd users are past this point
    let tutee = await usersCollection.findOne({_id: new ObjectID(req.params._id)});
    console.log(tutee)
    tutee.name.first = tutee.name.first.split(" ").map(x => x ? x[0].toUpperCase() + x.slice(1) : "").join(" ");
    tutee.name.last = tutee.name.last.split(" ").map(x => x ? x[0].toUpperCase() + x.slice(1) : "").join(" ");
    let sessionData = await summariesCollection.find({"tutee.id": req.params._id}).sort({date: -1}).limit(100).toArray();
    res.render("tutee", {user: req.user, summaries: sessionData, tutee: tutee});
});

module.exports = router;