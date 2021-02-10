let express = require("express");
let app = express(); //create express app

app.set("view engine", "ejs"); //use EJS for view engine
app.use(express.static("public")) //static files served from /public/, (eg. url.com/img/example.png serves from /public/img/example.png)

//routes
app.use("/student", require("./routes/student.js")); //anything send to /student... will be sent to student.js
app.use("/tutor", require("./routes/tutor.js"));
app.use("/summary", require("./routes/summary.js"));

app.get("/", (req,res) => {
    res.render("index.ejs", {});
})

app.listen(8080, () => {console.log("Listening on port 8080")})