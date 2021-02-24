let express = require("express");

router = express.Router();

// import the MongoClient class and make a client with the url to our database
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.kfvlj.mongodb.net/merry-tutor?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// connect to the client and pass a reference to the Summaries collection to the global scope so we can use it later
let summaryCollection;
mongoClient.connect(err => {
    if (err) console.log(err);
    summaryCollection = mongoClient.db("merry-tutor").collection("Summaries");
    console.log("Connected to Summaries collection");
});

router.get("/new", (req,res) => {
    res.render("sessionsummary", {});
});

router.post("/new", (req,res) => {
    let submission = req.body;
    summaryCollection.insertOne(submission); //instead, create new js object format (refer to doc) and THEN insert into collection
}) 

module.exports = router;

