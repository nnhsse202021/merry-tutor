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


router.get("/allsummaries", async (req,res) => {
    if (!req.user) { //must be logged in to see a tutee's data
        res.status(401).render("error", {code: 403, description: "You must be logged in to preform this action."});
        return;
    } else if (!(req.user.roles.includes("board"))) { //if you are not a board member, you cannot access this data
        res.status(403).render("error", {code: 403, description: "Unauthoried for logged in user."});
        return;
    }

    //only auth'd users are past this point
    let sessionData = await summariesCollection.find({}).sort({date: -1}).limit(100).toArray();
    res.render("allsummaries", {user: req.user, summaries: sessionData});
});

module.exports = router;