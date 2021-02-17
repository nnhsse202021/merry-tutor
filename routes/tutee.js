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


router.get("/:_id", (req,res) => {
    if (!req.user) { //must be logged in to see a tutee's data
        res.status(401).render("error", {code: 403, description: "You must be logged in to preform this action."});
        return;
    } else if (!(req.user.roles.includes("tutor") || req.user.children.includes(req.params._id)) && req.user._id != req.params._id) { //if you are a tutor or a parent of the id you are fine, otherwise your id must match this tutee
        res.status(403).render("error", {code: 403, description: "Unauthoried for logged in user."});
        return;
    }

    //only auth'd users are past this point
    let tutee = usersCollection.find(ObjectID(req.params._id));
    let summaries = summariesCollection.find({tutee_id: req.params._id}).toArray();
    res.render("tutee", {user: req.user, summaries: await summaries, tutee: await tutee});
});

module.exports = router;