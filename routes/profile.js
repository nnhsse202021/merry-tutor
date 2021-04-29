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


router.get("/:_id?", async (req,res) => {
    if (!req.user) { //if you arent logged in err
        res.status(401).render("error", {code: 401, description: "You must be logged in to perform this action."});
        return;
    } else if (!(req.user.roles.includes("board")) && req.params._id && req.user._id != req.params._id) { //if you are not board, you requested a specific id, and that id isnt you, err
        res.status(403).render("error", {code: 403, description: "Unauthoried for logged in user."});
        return;
    }
    let profile = await usersCollection.findOne({_id: new ObjectID(req.params._id || req.user._id)});

    res.render("profile", {user: req.user, profile});
})

module.exports = router;