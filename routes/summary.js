let express = require("express");

router = express.Router();

// import the MongoClient class and make a client with the url to our database
const { MongoClient, ObjectID } = require('mongodb');
if(process.env.PRODUCTION) {
	console.log("Running on production server...");
	var protocol = "mongodb";
	var mongoHost = "localhost";
}
else {
	console.log("Running for development...");
	var protocol = "mongodb+srv";
	var mongoHost = "cluster0.kfvlj.mongodb.net";
}
const uri = `${protocol}://admin:${process.env.MONGO_PASSWORD}@${mongoHost}/merry-tutor?retryWrites=true&w=majority`;
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
    if (!req.user) { //must be logged in to see a tutee's data
        res.status(401).render("error", { code: 401, description: "You must be logged in to perform this action." });
        return;
    } else if (!(req.user.roles.includes("tutor"))) { //if you are not a tutor, you cannot access this data
        res.status(403).render("error", { code: 403, description: "Unauthorized for logged in user." });
        return;
    }

    res.render("sessionsummary", { user: req.user });
});

router.post("/new", async (req, res) => {
    let formData = req.body; //req.body is a js object of the formnpm`
    // create js object to be inserted into document
    let tutorDoc = await find_user(formData["tutor-name"]);
    let tuteeDoc = await find_user(formData["tutee-name"]);
    let shadowDoc = await find_user(formData["shadow-name"]);
    if (!tutorDoc || !tuteeDoc){
        res.render("sessionsummary", { user: req.user, formData: formData });
        return
    }
    let formObj = {
        date: Date.parse(formData["session-date"]),
        tutor: {
            id: String(tutorDoc["_id"]),
            name: {
                first: tutorDoc["name"]["first"],
                last: tutorDoc["name"]["last"]
            }
        },
        tutee: {
            id: String(tuteeDoc["_id"]),
            name: {
                first: tuteeDoc["name"]["first"],
                last: tuteeDoc["name"]["last"]
            }
        },
        shadow: {
            id: shadowDoc ? shadowDoc["_id"] : undefined,
            name: {
                first: shadowDoc ? shadowDoc["name"]["first"] : undefined,
                last: shadowDoc ? shadowDoc["name"]["last"] : undefined
            }
        },

        subject: formData["subject"],
        session_duration: formData["session-duration"],

        fields: {
            what_they_learned: formData["what-they-learned"],
            homework: formData["at-home-suggestion"],
            next_time: formData["next-session-suggestion"]
        }
    }
    if (formObj.tutor.id && formObj.tutee.id) {    // validate for tutor_id and tutee_id
        summaryCollection.insertOne(formObj);
        console.log("form submitted");
        res.redirect("../");
        return
    } else { // invalid form 
        // if invalid, alert user, keep form data
        res.render("sessionsummary", { user: req.user, formData: formData });
        return
    }
});

async function find_user(name) {
    let [last, first] = name.replace(", ", ",").split(",");
    // find one doc with name.first being the first name and name.last being the last name. All names are stored in lower case.
    let userDoc = await usersCollection.findOne(
        {
            name: {
                first: (first ?? "").toLowerCase(),
                last: (last ?? "").toLowerCase()
            }
        });
    if (!userDoc) {
        return undefined;
    }
    return userDoc;
}

module.exports = router;

