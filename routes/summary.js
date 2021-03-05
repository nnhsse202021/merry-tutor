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

// connect to the client and pass a reference to the Users collection to the global scope so we can use it later
let usersCollection;
mongoClient.connect(err => {
    if (err) console.log(err);
    usersCollection = mongoClient.db("merry-tutor").collection("Users");
    console.log("Connected to Users collection");
});

router.get("/new", (req, res) => {
    res.render("sessionsummary", {});
});

router.post("/new", async (req, res) => {
    let formData = req.body; //req.body is a js object of the form
    console.log(formData);

    // create js object to be inserted into document
    let formObj = {
        date: Date.parse(formData["session-date"]),
        tutor_id: await find_id(formData["tutor-name"]), 
        tutee_id: await find_id(formData["tutee-name"]), // somehow attach parent email
        shadow_id: await find_id(formData["shadow-name"]),
        subject: formData["subject"],

        fields: {
            what_they_learned: formData["what-they-learned"],
            homework: formData["at-home-suggestion"],
            next_time: formData["next-session-suggestion"]
        }
    }
    console.log(formObj)
    if(formObj.tutor_id && formObj.tutee_id){    // validate for tutor_id and tutee_id
        summaryCollection.insertOne(formObj);
        console.log("1 document inserted");
        res.redirect("../");
    } else { // invalid form 
        // if invalid, alert user, keep form data
        res.render("sessionsummary", {formData: formData});
    }
});

/*  
    name to id function (author: Dylan Schmit)
    Makes an async function so you can use await. 
    Functions that return a promise can have await put before them and code execution will wait for the promise to resolve and 
    return its value you can make an arrow function async by turning `() => {...}` into `async () => {...}`
    */
async function find_id(name) {
    let [last, first] = name.replace(", ", ",").split(",");
    // find one doc with name.first being the first name and name.last being the last name. All names are stored in lower case.
    let userDoc = await usersCollection.findOne(
        {
            name: {
                first: (first ?? "").toLowerCase(),
                last: (last ?? "").toLowerCase()
            }
        });
    console.log(userDoc); // log the document of queried user
    if (!userDoc) {
        return undefined;
    }
    user_id = userDoc["_id"];
    console.log(user_id) // log user id
    return user_id;
}

module.exports = router;

