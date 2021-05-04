let express = require("express");

// import the MongoClient class and make a client with the url to our database
const MongoClient = require('mongodb').MongoClient;
if(process.env.PRODUCTION) {
	console.log("Running on production server...");
	var protocol = "mongodb":
	var mongoHost = "localhost";
}
else {
	console.log("Running for development...");
	var protocol = "mongodb+srv":
	var mongoHost = "cluster0.kfvlj.mongodb.net";
}
const uri = `${protocol}://admin:${process.env.MONGO_PASSWORD}@${mongoHost}/merry-tutor?retryWrites=true&w=majority`;
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
    let results = (await usersCollection.aggregate([
        {
          '$addFields': {
            'fullname': {
              '$concat': [
                '$name.first', ' ', '$name.last'
              ]
            }
          }
        }, {
          '$match': {
            'fullname': new RegExp(`${req.query.input}.*`)
          }
        }, {
          '$project': {
            'fullname': 1
          }
        }
      ]).toArray()).map(x => [x.fullname, String(x._id)])
    res.json(results);
});

module.exports = router;