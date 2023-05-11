const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const app = express();


mongoose.connect("mongodb://localhost:27017/loginDB", {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB database connection established successfully");
});

const userSchema = new mongoose.Schema({
  email: {type: String, unique: true},
  password: String,
  age: Number,
  height: Number,
  weight: Number,
  allergy: [String],
  activity: String,
  fitness: String
});
userSchema.pre('save', async function (next) {
  const user = this;
  const hash = await bcrypt.hash(user.password, 10);
  user.password = hash;
  next();
});



const User = mongoose.model('User', userSchema);




//get functions
app.get("/", function(request, response) {
  response.render("home", {testVar: "test"});
});
app.get("/login", function(req, res) {
  res.render("login", {testVar: "test"});
});
app.get("/signup", function(req, res) {
  res.render("signup", {testVar: "test"});
});
app.get("/contact", function(req, res) {
  res.render("home", {testVar: "test"});
});

//signup form post method

app.post("/signup", async (req, res) => {
  //works like a charm
  const email = req.body.email;
  const password = req.body.password;
  const age =  req.body.age;
  const height =  req.body.height;
  const weight =  req.body.weight;
  const allergy = req.body.allergies;
  const activity = req.body.activity;
  const fitness = req.body.fitness;



  const user = new User({ email, password, age, height, weight, allergy, activity, fitness});
  try {
     await user.save();
     res.render("home", {testVar: "test"});
  } catch (error) {
     res.status(500).send("Error creating user");
  }

  res.send("sex dedo");
});



// login form post method
app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = await User.findOne({email});
  if (!user) {
    return res.status(404).send("User not found");
    // res.render("home", {testVar: "test"});
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).send("Invalid password");
  }
  res.render("home", {testVar: "test"});
});



//port stuff
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
