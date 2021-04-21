let express = require("express");
const CLIENT_ID = "1037005622588-7dul28gjauau6d2b3572ue7vq9cgggcc.apps.googleusercontent.com"

let {OAuth2Client} = require('google-auth-library');
let oAuth2Client = new OAuth2Client(CLIENT_ID);

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

router.post("/v1/newUser", async (req, res) => {
    if (!req.user || req.user.roles.length != 0) return;
    let newUserData = req.body;
    let user = req.user;
    console.log(newUserData);
    if (newUserData.isParent) {
        user.roles.push("parent");
        if (newUserData.existingChildEmail) {
            let child_id = await findIdByEmail(newUserData.existingChildEmail);
            if (child_id) user.children.push(String(child_id));
        } else if (newUserData.newChildData) {
            let child = {
                name: {
                    first: (newUserData.newChildData.name.first || "").toLowerCase(),
                    last: (newUserData.newChildData.name.last || "").toLowerCase(),   
                },
                email: newUserData.newChildData.email,
                google_sub: null,
                roles: ["tutee"],
                children: []
            }
            user.children.push(String((await usersCollection.insertOne(child)).ops[0]._id));
            await usersCollection.replaceOne({_id: user._id}, user, {upsert: true})
        } 
    } else {
        user.roles.push("tutee");
        console.log(newUserData.parentEmails) // we can send them an email, or do something to allow them to make an account
    }
    await usersCollection.replaceOne({_id: user._id}, user, {upsert: true})
    res.json(true);
})
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

async function findIdByEmail(email) {
    // find one doc with name.first being the first name and name.last being the last name. All names are stored in lower case.
    let userDoc = await usersCollection.findOne({email:email});
    if (!userDoc) {
        return undefined;
    }
    user_id = userDoc["_id"];
    return user_id;
}

// Logout
router.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect("/");
});

module.exports = router;