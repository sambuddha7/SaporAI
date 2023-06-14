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

//api 
const {Configuration, OpenAIApi} = require("openai");

//api key auth
const config = new Configuration({
  apiKey: process.env.API_KEY
});
//instance of openai
const openai = new OpenAIApi(config);


const app = express();
var result = "";

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
mongoose.connect(`mongodb+srv://sbiswas7:${mongopw}@cluster0.mtk5ama.mongodb.net/`, {useNewUrlParser: true});
// mongoose.connect("mongodb://localhost:27017/usertestDB", {useNewUrlParser: true});

const db = mongoose.connection;



db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB database connection established successfully");
});

const userSchema = new mongoose.Schema({
  // email: {type: String, unique: true, sparse: true},
  password: String,
  name: String,
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


const User = mongoose.model('User', userSchema);

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
  callbackURL: "http://localhost:3000/auth/google/signup-2"
  // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function (accessToken, refreshToken, profile, cb) {
  User.findOne({ googleId: profile.id })
    .then((user) => {
      if (!user) {
        user = new User({
          username: profile.id,
          googleId: profile.id
        });
        user.save()
          .then((savedUser) => {
            cb(null, savedUser);
          })
          .catch((err) => {
            cb(err);
          });
      } else {
        cb(null, user);
      }
    })
    .catch((err) => {
      cb(err);
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
    console.log(req.user);
    User.findById(req.user.id).then((foundUser) => {
      if (foundUser) {
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
    // User.findOne(req.user.username).then((foundUser) => {
    //   if (foundUser) {
    //     console.log(foundUser);
    //     // res.redirect("/signup-2");
    //     if (typeof foundUser.age === 'undefined') {
    //       res.redirect("/signup-2");
    //     } else {
    //       res.redirect("/user");
    //     }
    //   }
    // }).catch(function(err) {
    //   console.log("goauth error");
    // })
  })
app.get("/login", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/user");
  } else {
    res.render("login", { error: '' });
  }
  
});
app.get("/signup", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/user");
  } else {
    res.render("signup");
  }
  
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

  if (req.isAuthenticated()) {
    User.findById(req.user.id).then((foundUser) => {
      if (foundUser) {
        const weight = foundUser.weight;
        const height = foundUser.height;
        const age = foundUser.age;
        const gender = foundUser.gender;
        const activityLevel = foundUser.activity;
        if (gender === 'Male' || gender === 'Other') {
          // For males: BMR = 66 + (6.23 × weight in lbs) + (12.7 × height in inches) - (6.8 × age in years)
          bmr = Math.floor(66 + (6.23 * weight) + (12.7 * height) - (6.8 * age));
        } else if (gender === 'Female') {
          // For females: BMR = 655 + (4.35 × weight in lbs) + (4.7 × height in inches) - (4.7 × age in years)
          bmr = Math.floor(655 + (4.35 * weight) + (4.7 * height) - (4.7 * age));
        }
        const activityLevels = {
          Sedentary: 1.2, // Little to no exercise
          Light: 1.375,   // Light exercise/sports 1-3 days per week
          Moderate: 1.55, // Moderate exercise/sports 3-5 days per week
          Active: 1.725,  // Active exercise/sports 6-7 days per week
          VeryActive: 1.9 // Very active exercise/sports & physical job or 2x training
        };

        var maintenanceCalories = Math.round(bmr * activityLevels[activityLevel]);
        if (foundUser.goal == "WeightLoss") {
          maintenanceCalories -= 200;
        } else if (foundUser.goal == "WeightGain") {
          maintenanceCalories += 100;
        }
        res.render("user", {userName: foundUser.name, BMR: maintenanceCalories, Weight: weight});
      }
    }).catch(function(err) {
      console.log("user error");
    })
    
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

app.get("/result-2", function(req, res) {
  res.render("result-2", {result});
});

app.get("/result-1", function(req, res) {
  res.render("result-1", {result});
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
  const name = req.body.name;
  User.findById(req.user.id).then(function(foundUser){
    if (foundUser) {
      foundUser.name = name;
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

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render('login', { error: 'Incorrect username or password.' });
    }
    req.logIn(user, (err) => {
      if (err) {
        // Handle error
        return next(err);
      }
      // User authentication succeeded, redirect or render a success page
      return res.redirect('/user');
    });
  })(req, res, next);
});


app.post("/result-2", async(req, res) => {
  //api calls to be added
  var meal = req.body.meal;
  var ingredients = JSON.parse(req.body.listData);
  console.log("Ingredients:", ingredients);
  var calories = req.body.selection;
  var prompt = `Provide a list of 5 ${meal} recipes in the calorie range of ${calories} using the ingredients ${ingredients}`;
  console.log(prompt);
  //api calls
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: prompt}],
  });
  //handle api response
  result = completion.data.choices[0].message.content;
  res.redirect("/result-2");
});

app.post("/result-1", async(req, res) => {
  //api calls to be added
  var meal = req.body.meal;
  var calories = req.body.selection;
  var type = req.body.type;
  var proteins = req.body.proteins;
  var carbs = req.body.carbs;
  var fats = req.body.fats;
  var prompt = `Provide a list of 5 ${type} ${meal} recipes in the calorie range of ${calories}, with the macros proteins: ${proteins} grams, carbs: ${carbs} grams, fats:${fats} grams`;
  console.log(prompt);
  //api calls
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: prompt}],
  });
  //handle api response
  result = completion.data.choices[0].message.content;
  res.redirect("/result-1");
});

//port stuff
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
