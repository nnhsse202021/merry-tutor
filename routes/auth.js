let express = require("express");
const CLIENT_ID = "1037005622588-7dul28gjauau6d2b3572ue7vq9cgggcc.apps.googleusercontent.com"

let {OAuth2Client} = require('google-auth-library');
let oAuth2Client = new OAuth2Client(CLIENT_ID);

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.kfvlj.mongodb.net/merry-tutor?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let usersCollection;
mongoClient.connect(err => {
    if (err) console.log(err);
    usersCollection = mongoClient.db("merry-tutor").collection("Users");
    console.log("Auth Route Connected to Users collection");
});

/*
User Data Schema:
{
    _id: "string",
    name: {
        first: "First",
        last: "Last"
    },
    email: "example@gmail.com", (optional)
    google_sub: "string" (optional)
    roles: ["tutee", "parent", "tutor", "board"],
    children: ["id1", "id2"],
}
*/
router = express.Router();

router.post("/v1/google", async (req, res) => {
    let { token }  = req.body;
    let ticket = await oAuth2Client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    console.log(ticket.getPayload());
    let {sub, email, given_name, family_name} = ticket.getPayload();
    //do something with the payload and get internal userId, using sub as a replacement for now
    let user = getOrMakeUser(sub, email, given_name.toLowerCase(), family_name.toLowerCase());
    req.session.userId = user._id;
    res.status(201);
    res.json({});
})

/*
Returns a user and updates if info if needed if it finds a match in the database otherwise it makes a new user, adds it to the database, and returns it
Matching priority:
1. google_sub
2. email
3. name (first and last)
*/
async function getOrMakeUser(google_sub, email, given_name, family_name) {
    let user = await usersCollection.findOne({google_sub: google_sub}); //see if a user exists with their google account
    if (!user) user = await usersCollection.findOne({email: email}); //see if a user exists with their email
    if (!user) user = await usersCollection.findOne({name: {first: given_name, last: family_name}}); //see if a user exists with their name
    if (!user) {
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
        Object.assign(user, {
            name: {
                first: given_name,
                last: family_name
            },
            email: email,
            google_sub: google_sub
        });
        
        await usersCollection.replaceOne({_id: user._id}, user, {upsert: true}) // replace the user document if it exists, make it if it doesn't
    }
    console.log(user);
    
    //update user with any new data

    return user;
}
module.exports = router;