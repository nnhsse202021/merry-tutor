let express = require("express");
let app = express(); //create express app

app.set("view engine", "ejs"); //use EJS for view engine
app.use(express.static("public")) //static files served from /public/, (eg. url.com/img/example.png serves from /public/img/example.png)