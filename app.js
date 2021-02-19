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

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.kfvlj.mongodb.net/merry-tutor?retryWrites=true&w=majority`;
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
    if(req.session.userId) req.user = await usersCollection.findOne({_id: req.session.userId}); //if there is a user id, set req.user to that user data object 
    next()
})

//routes
app.use("/student", require("./routes/student.js")); //anything send to /student... will be sent to student.js
app.use("/tutor", require("./routes/tutor.js"));
app.use("/summary", require("./routes/summary.js"));
app.use("/auth", require("./routes/auth.js"));

app.get("/", (req,res) => {
    res.render("index.ejs", {user: req.user});
})

app.get("/login", (req,res) => {
    res.render("login");
})

app.listen(8080, () => {console.log("Listening on port 8080")});
