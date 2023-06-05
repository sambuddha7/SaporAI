require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const mongoose = require("mongoose");

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');



const app = express();


app.use(session({
  secret: "Meal2Go",
  resave: false,
  saveUninitialized:false
}))
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());


const mongopw = process.env.MONGOPW;
mongoose.connect(`mongodb+srv://sbiswas7:${mongopw}@cluster0.mtk5ama.mongodb.net/userDB`, {useNewUrlParser: true});
// mongoose.connect("mongodb://localhost:27017/usertestDB", {useNewUrlParser: true});

const db = mongoose.connection;



db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB database connection established successfully");
});

const userSchema = new mongoose.Schema({
  // email: {type: String, unique: true, sparse: true},
  password: String,
  age: Number,
  height: Number,
  weight: Number,
  allergy: [String],
  activity: String,
  gender: String,
  googleId: String,
  preference: String,
  goal: String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


// userSchema.pre('save', async function (next) {
//   const user = this;
//   const hash = await bcrypt.hash(user.password, 10);
//   user.password = hash;
//   next();
// });



const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/signup-2",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));


//get functions
app.get("/", function(request, response) {
  response.render("home", {testVar: "test"});
});
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/signup-2', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/goauth');
});
app.get("/goauth", function(req,res) {
    User.findOne(req.user.username).then((foundUser) => {
      if (foundUser) {
        console.log(foundUser);
        // res.redirect("/signup-2");
        if (typeof foundUser.age === 'undefined') {
          res.redirect("/signup-2");
        } else {
          res.redirect("/user");
        }
      }
    }).catch(function(err) {
      console.log("goauth error");
    })
  })
app.get("/login", function(req, res) {
  res.render("login", {testVar: "test"});
});
app.get("/signup", function(req, res) {
  res.render("signup", {testVar: "test"});
});
app.get("/signup-2", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("signup-2");
  } else {
      res.redirect("/login");
  }
});
app.get("/contact", function(req, res) {
  res.render("home", {testVar: "test"});
});
app.get("/form-ai1", function(req, res) {
  res.render("form-ai1", {testVar: "test"});
});
app.get("/user", function(req, res) {
  // res.render("user", {testVar: "test"});
  if (req.isAuthenticated()) {
    res.render("user");
  } else {
      res.redirect("/login");
  }
});
app.get("/form-ai2", function(req, res) {
  res.render("form-ai2", {testVar: "test"});
});
app.get("/logout", function(req,res) {
  req.logout(function(err) {
      if (err) { console.log("logout-error") }
      res.redirect('/');
    });
});
//signup form post method

app.post("/signup", async (req, res) => {
  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
        console.log(err);
        res.redirect("/signup");
    } else {
        passport.authenticate("local")(req, res, function(){
           res.redirect("/signup-2"); 
        });
    }
  });
});

app.post("/signup-2", function(req, res) {
  const age =  req.body.age;
  const gender = req.body.gender;
  const height =  parseInt(req.body.feet * 12) + parseInt(req.body.inches);
  const weight =  req.body.weight;
  const allergy = req.body.allergies;
  const activity = req.body.activity;
  const preference = req.body.preference;
  const goal = req.body.goal;
  User.findById(req.user.id).then(function(foundUser){
    if (foundUser) {
      foundUser.age = age;
      foundUser.gender = gender;
      foundUser.height = height;
      foundUser.weight = weight;
      foundUser.allergy = allergy;
      foundUser.activity = activity;
      foundUser.preference = preference;
      foundUser.goal = goal;
      foundUser.save().then(()=> {
        res.redirect("/user");
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }).catch(function(err) {
    console.log(err);
  })
});

app.post("/login", function(req, res) {
  const user = new User({
      username: req.body.username,
      password: req.body.password
  });
  req.logIn(user, function (err) {
      if (err) {
          console.log("login-error");
          res.redirect("/login");
      } else {
          passport.authenticate("lcoal")(req, res, function() {
              console.log("success");
              res.redirect("/user");
          })
      }
  })
});



//port stuff
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
