require('dotenv').config()
const express = require("express");

const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");

const mongoose = require("mongoose");

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const axios = require('axios');

//api 
const {Configuration, OpenAIApi} = require("openai");

//diff file 

const {fetchYouTubeData} = require("./views/api-calls/youtubeApi.js");

//open ai api key auth
const config = new Configuration({
  apiKey: process.env.API_KEY // open ai
});
//instance of openai
const openai = new OpenAIApi(config);


const app = express();
app.locals._ = _;

var result = "";
var image_url;
var last_ai = "";

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


const { User } = require('./views/api-calls/db.js');

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
  callbackURL: "https://saporai.com/auth/google/signup-2"
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
  if (request.isAuthenticated()) {
    response.redirect("/user");
  } else {
    response.render("home");
  }
  
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
  })
app.get("/login", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/user");
  } else {
    res.render("login", { error: '' });
  }
});
app.get("/terms",function(req,res){
  res.render("terms");
}) 
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
  // res.render("signup-2");
});

app.get("/form-ai1", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("form-ai1");
  } else {
    res.redirect("login");
  }
});

app.get("/tr", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("tr");
  } else {
    res.render("../login");
  }
});

app.get("/tr1", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("tr1");
  } else {
    res.render("../login");
  }
});
const getUserRoute = require('./views/routes/getUser.js');


//user dashboard get route
app.use("/user", getUserRoute);

app.get("/form-ai2", function(req, res) {
  if (req.isAuthenticated()) {
      res.render("form-ai2");
    } else {
      res.redirect("login");
    }
});
app.get("/logout", function(req,res) {
  req.logout(function(err) {
      if (err) { console.log("logout-error") }
      res.redirect('/');
    });
});

app.get("/result-2", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("result-2", {result, last_ai});
    } else {
      res.redirect("login");
    }
});
app.get("/settings", function(req,res) {
  if (req.isAuthenticated()) {
    User.findById(req.user.id).then(function(foundUser) {
      if (foundUser) { 
        var feet = Math.floor(foundUser.height / 12);
        var inches = foundUser.height % 12;
        res.render("settings", {Name: foundUser.name, Age: foundUser.age, Weight: foundUser.weight, Gender: foundUser.gender, Feet: feet, Inches: inches, Activity: foundUser.activity, Preference: foundUser.preference, Goal: foundUser.goal, Allergy: foundUser.allergy, WeightUnit: foundUser.weightUnit});
      }
    }).catch(function(err) {
      console.log(err);
    })
  } else {
    res.redirect("login");
  }
  // res.render("settings");
})
app.get("/recipe-history", function(req, res) {
  User.findById(req.user.id).then(function(foundUser) {
    if (foundUser) { 
      res.render("recipe-history", {HistoryArray: foundUser.recipeHistory});
    }
  }).catch(function(err) {
    console.log(err);
  })

  
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
  const weightUnit = req.body.weightUnit;
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
      foundUser.weightUnit = weightUnit;
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
app.post('/update', function(req, res) {
  const age =  req.body.age;
  const gender = req.body.gender;
  const height =  parseInt(req.body.feet * 12) + parseInt(req.body.inches);
  const weight =  req.body.weight;
  const allergy = req.body.allergies;
  const activity = req.body.activity;
  const preference = req.body.preference;
  const goal = req.body.goal;
  const name = req.body.name;
  const weightUnit = req.body.weightUnit;
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
      foundUser.weightUnit = weightUnit;
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

// favorites section

//GPT SECTION
async function getAllergy(req) {
  try {
    let foundUser = await User.findById(req.user.id);
    if (foundUser) {
      return foundUser.allergy;
    }
    else {
      return "none"; // or whatever default value you want to use
    }
  }
  catch (err) {
    console.log(err);
    return 0; // or whatever default value you want to use
  }
}
async function getPreference(req) {
  try {
    let foundUser = await User.findById(req.user.id);
    if (foundUser) {
      return foundUser.preference;
    }
    else {
      return "non-vegetarian"; // or whatever default value you want to use
    }
  }
  catch (err) {
    console.log(err);
    return 0; // or whatever default value you want to use
  }
}
async function getCalories(req) {
  try {
    let foundUser = await User.findById(req.user.id);
    if (foundUser) {
      return Math.floor(foundUser.maintenance / 4);
    }
    else {
      return "300-500"; // or whatever default value you want to use
    }
  }
  catch (err) {
    console.log(err);
    return 0; // or whatever default value you want to use
  }
}
var meal;
var ingredients;
var calories;
var allergy;
var pref;
var cuisine;
app.post("/tr", async (req, res) => {
  allergy = await getAllergy(req);
  pref = await getPreference(req);
  meal = req.body.meal;
  ingredients = JSON.parse(req.body.listData);
  calories = req.body.selection;
  cuisine = req.body.cuisine;
  if (typeof calories === 'undefined') {
    calories = await getCalories(req);
    if (meal == 'snack') {
      calories /= 1.6;
    }
  }
  res.redirect("/tr");
});

var meal;
var calories;
var type;
var diet;
var cuisine;
app.post("/tr1", async (req, res) => {
  allergy = await getAllergy(req);
  pref = await getPreference(req);
  meal = req.body.meal;
  calories = req.body.selection;
  type = req.body.type;
  diet = req.body.diet;
  cuisine = req.body.cuisine;
  if (typeof calories === 'undefined') {
    calories = await getCalories(req);
    if (meal == 'snack') {
      calories /= 1.6;
    }
  }
  res.redirect("/tr1");
});




app.post("/result-2", async(req, res) => {
  //api calls to be added
  last_ai = 2;
  const marker = "###SECTION_MARKER###";
  // var prompt = `Provide a list of 5 ${meal} recipes in the calorie range of ${calories} using the ingredients ${ingredients}`;
  var prompt = `Provide a ${cuisine} ${meal} recipe in the calorie range of ${calories} using only the ingredients ${ingredients}, some optional spices, optional garnishing and oils of your choice. Keep mind of the following diet allergies: ${allergy} . Strict diet preference of ${pref} Respond in the format:
   Dish Name:
   ${marker}
   Nutrtional Information:
   ${marker}
   Ingredients:
   ${marker}
   Instructions:`;

  //api calls
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role:"system", "content" : "You will always respond strictly in the format mentioned in the prompt"},{role: "user", content: prompt}],
  });
  //handle api response
  result = completion.data.choices[0].message.content;
  // console.log(result);
  const sections = result.split(marker);

// Extract the nutrition information, ingredients, and recipe steps
  const name = sections[0];

  var recName = name.split(':');
  recName = recName[1];
  var nutritionInfo = sections[1];
  var ingredientss = sections[2];
  var recipeSteps = sections[3];
  User.findById(req.user.id).then((foundUser) => {
    if (foundUser) {
      var histArray = foundUser.recipeHistory;
      var toPush = [recName, nutritionInfo, ingredientss, recipeSteps];
      histArray.push(toPush);
      foundUser.recipeHistory = histArray;
      recName = _.kebabCase(recName);
      
      foundUser.save().then(()=> {
        res.json({ recName: _.kebabCase(recName) });
        res.redirect("/result/" + recName);
      })
      .catch((err) => {
        console.log("user not found");
      });
    }
  }).catch(function(err) {
    console.log("user error");
  })
});

app.get("/result/:recName", async function(req, res) {
  if (req.isAuthenticated()) {
    const marker = "###SECTION_MARKER###";
    const sections = result.split(marker);
    const name = sections[0];
    var nutritionInfo = sections[1];
    var ingredientss = sections[2];
    var recipeSteps = sections[3];
    if (sections.length > 4) {
      nutritionInfo = sections[1];
      ingredientss = sections[3];
      recipeSteps = sections[5];
    }
    var recName = name.split(':');
    recName = recName[1];
    apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${youtubeKey}&part=snippet&q=${recName}&type=video`

    //youtube api call
    youtubeVideos = [];
    try {
      const youtubeData = await fetchYouTubeData(apiUrl);
      
      for (var i = 0; i < 3; i++) {
        youtubeVideos.push('https://www.youtube.com/embed/' + youtubeData.items[i].id.videoId + '?si=YOhj4nHHBS4vW1NX');
      }
      
    } catch {
      console.error('Error fetching YouTube data:', error.message);
    }
    res.render("result-2", {recipeName: name, nutrInfo: nutritionInfo, ingr: ingredientss, steps: recipeSteps, image:image_url, last_ai, link_list: youtubeVideos});
  } else {
    res.redirect("login");
  }
});

app.post("/result-1", async(req, res) => {
  //api calls to be added
  last_ai = 1;
  const marker = "###SECTION_MARKER###";
  var prompt = `Provide a ${cuisine} ${type} ${meal} ${diet} recipe in the calorie range of ${calories}. Keep mind of the following diet allergies: ${allergy} . Strict diet preference of ${pref} Respond in the format:
  Dish Name:
  ${marker}
  Nutrtional Information:
  ${marker}
  Ingredients:
  ${marker}
  Instructions:`;
  //api calls
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role:"system", "content" : "You will always respond strictly in the format mentioned in the prompt"},{role: "user", content: prompt}],
  });
  //handle api response
  result = completion.data.choices[0].message.content;
  const sections = result.split(marker);

// Extract the nutrition information, ingredients, and recipe steps
  const name = sections[0];

  var recName = name.split(':');
  recName = recName[1];
  var nutritionInfo = sections[1];
  var ingredientss = sections[2];
  var recipeSteps = sections[3];
  
  User.findById(req.user.id).then((foundUser) => {
    if (foundUser) {
      var histArray = foundUser.recipeHistory;
      var toPush = [recName, nutritionInfo, ingredientss, recipeSteps];
      histArray.push(toPush);
      foundUser.recipeHistory = histArray;
      recName = _.kebabCase(recName);
      
      foundUser.save().then(()=> {
        res.json({ recName: _.kebabCase(recName) });
        res.redirect("/result/" + recName);
      })
      .catch((err) => {
        console.log("user not found");
      });
    }
  }).catch(function(err) {
    console.log("user error");
  })
});


app.get("/history/:recName", function(req, res) {
  last_ai = 3;
  if (req.isAuthenticated()) {
    User.findById(req.user.id).then((foundUser) => {
      if (foundUser) {
        var histArray = foundUser.recipeHistory;
        for (let i = histArray.length - 1; i >= 0; i--) {
          var toMatch = histArray[i][0];
          toMatch = _.kebabCase(toMatch);
          var par = req.params.recName;
          par = _.kebabCase(par);
          if (toMatch == par) {
              console.log(histArray[i][0]);
              res.render("result-2", {recipeName: histArray[i][0], nutrInfo: histArray[i][1], ingr: histArray[i][2], steps: histArray[i][3], last_ai});
              break;
          } 
        }
        res.redirect("user");
      }
    }).catch(function(err) {
      console.log("his error");
    })
  } else {
    res.redirect("../login");
  }
  // res.render("result-2", {recipeName: name, nutrInfo: nutritionInfo, ingr: ingredientss, steps: recipeSteps});
});


app.get("/test", function(req,res) {
  res.render("test");
})

app.get("/verify/:userId/:uniqueString", (req, res) => {
  let {userId, uniqueString} = req.params;
  userVerification
    .find({userId})
    .then((result) => {
      const {expiresAt} = result[0];
      const hashedUniqueString  = result[0].uniqueString;
      if (expiresAt < Date.now()) {
        userVerification
          .deleteOne({userId})
          .then(result => {
            User
              .deleteOne({_id : userId})
              .then(() => {
                res.render("home");
              })
          })
      } else {
        bcrypt
          .compare(uniqueString, hashedUniqueString)
          .then(result => {
            if (result) {
              User
                .updateOne({_id: userId}, {verified: true})
                .then(() => {
                  userVerification
                    .deleteOne({userId})
                    .then(() => {
                      //add smn
                      res.send("email verified!");
                    })
                })

            } else {
              res.send("Check inbox again!");
            }
          })
      }
    })
    .catch((error) => {
      console.log(errorUser);
      res.send("error verifying!");
    })
});







//port stuff
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
