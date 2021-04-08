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

router.get("/newtutor", async (req,res) => {
    if (!req.user) { //must be logged in to see a tutee's data
        res.status(401).render("error", {code: 403, description: "You must be logged in to preform this action."});
        return;
    } else if (!(req.user.roles.includes("board"))) { //if you are not a board member, you cannot access this data
        res.status(403).render("error", {code: 403, description: "Unauthoried for logged in user."});
        return;
    }

    res.render("newtutor", {user: req.user});
});

router.post("/newtutor", async (req, res) => {
    let formData = req.body;
    console.log(formData);

    res.render("newtutor", { user: req.user, formData: formData });
});

/*
Return + update a user if match in database otherwise make a new user, add it to the database and return it
Matching priority:
1. google_sub
2. email
3. name (first and last)
*/
async function getOrMakeUser(google_sub, email, given_name, family_name) {
    if (google_sub) var user = await usersCollection.findOne({google_sub: google_sub}); //see if a user exists with their google account
    if (!user) user = await usersCollection.findOne({email: email, google_sub: null}); //see if a user exists with their email
    if (!user) user = await usersCollection.findOne({name: {first: given_name, last: family_name}, google_sub: null}); //see if a user exists with their name
    if (!user) { //we are certain the user doesn't exist yet, let's make them from scratch
        user = {
            // _id generated when .insertOne is called with _id undefined
            name: {
                first: given_name,
                last: family_name
            },
            email: email,
            google_sub: google_sub,
            roles: [],
            children: []
        };
        await usersCollection.insertOne(user); // insert the user into the collection
    } else {
        Object.assign(user, { //update the user if we got any new information (this could probably be done a better way)
            name: {
                first: given_name,
                last: family_name
            },
            email: email,
            google_sub: google_sub
        });
        await usersCollection.replaceOne({_id: user._id}, user, {upsert: true}) // replace the user with the updated version
    }
    return user; //return the user (either newly made or updated)
}

// for reference
/*
router.post("/v1/google", async (req, res) => { //login.js sends the id_token to this url, we'll verify it and extract its data
    let { token }  = req.body; //get the token from the request body
    let ticket = await oAuth2Client.verifyIdToken({ //verify and decode the id_token
        idToken: token,
        audience: CLIENT_ID
    });
    let {sub, email, given_name, family_name} = ticket.getPayload(); //get the user data we care about from the id_token
    let user = await getOrMakeUser(sub, email, (given_name || "").toLowerCase(), (family_name || "").toLowerCase()); //call this function to get a reference to the user that's stored in the database
    req.session.userId = user._id; //sets "userId" on the session to the id of the user in the database
    res.status(201);
    res.json(user);
})
*/

module.exports = router;