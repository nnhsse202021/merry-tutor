let express = require("express");

// import the MongoClient class and make a client with the url to our database
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.kfvlj.mongodb.net/merry-tutor?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// connect to the client and pass a reference to the Users collection to the global scope so we can use it later
let usersCollection;
mongoClient.connect(err => {
    if (err) console.log(err);
    usersCollection = mongoClient.db("merry-tutor").collection("Users");
    console.log("Auth Route Connected to Users collection");
});

router = express.Router();
router.get("/",async (req,res) => {
    console.log( await usersCollection.aggregate( {$project: {"fullname": {$concat: ["$name.first"," ","$name.last"] } } } ).toArray() );
    res.send(req.query.input);
});

module.exports = router;