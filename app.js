require("dotenv").config();
let express = require("express");
let app = express(); //create express app

app.set("view engine", "ejs"); //use EJS for view engine
app.use(express.static("public")) //static files served from /public/, (eg. url.com/img/example.png serves from /public/img/example.png)

let session = require('express-session');
app.use(session({secret: "Shh, its a secret!"})); //REPLACE THE SECRET WITH SOMETHING SECURE LATER

let bodyParser = require("body-parser");
app.use(bodyParser.json()); //body parser for json
app.use(bodyParser.urlencoded()); //body parser for urlencoded

const { MongoClient, ObjectID } = require("mongodb");
const { Router } = require("express");

const mongoHost;
if(${process.env.PRODUCTION}) {
	console.log("Running on production server...");
	mongoHost = "localhost";
}
else {
	console.log("Running for development...");
	mongoHost = "cluster0.kfvlj.mongodb.net/merry-tutor";
}
const uri = `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@${mongoHost}?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

/* Middleware to attach user data to all requests */

//get the users collection the same way as auth.js
let usersCollection;
mongoClient.connect(err => {
    if (err) console.log(err);
    usersCollection = mongoClient.db("merry-tutor").collection("Users");
    console.log("Users Middleware Connected to Users collection");
});

//app.use takes a function that is added to the path of a request. When we call next() it goes to the next function in the path 
app.use(async (req, res, next) => {
    if(req.session.userId) req.user = await usersCollection.findOne(ObjectID(req.session.userId)); //if there is a user id, set req.user to that user data object
    if (!(req.path.startsWith("/auth") || req.path.startsWith("/login")) && req.user && req.user.roles.length == 0) { //make sure that the user completes the auth flow, people without roles are bad and arent allowed to do anything
        res.redirect("/login?firstTimeFlow");
        return;
    }
    next();
})

//routes
app.use("/tutee", require("./routes/tutee.js")); //anything send to /student... will be sent to student.jsnpm 
app.use("/summary", require("./routes/summary.js"));
app.use("/auth", require("./routes/auth.js"));
app.use("/autocomplete", require("./routes/autocomplete.js"));
app.use("/board", require("./routes/board.js"));
app.use("/parent", require("./routes/parent.js"));
app.use("/export", require("./routes/export.js"));
app.get("/", (req,res) => {
    res.render("index.ejs", {user: req.user});
})

app.get("/login", (req,res) => {
    res.render("login");
})

//error handler
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).render("error", {code: 500, description: "Internal Server Error"})
})

app.use((req,res,next) => {
    res.status(404).render("error", {code: 404, description: "The Requested Page Was Not Found"})
})

app.listen(8080, () => {console.log("Listening on port 8080")});
