const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");


const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
// app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(request, response) {
  response.render("home", {testVar: "test"});
});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
