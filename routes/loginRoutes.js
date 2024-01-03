const express = require('express');
const router = express.Router();

const passport = require('passport');


router.post("/signup", async (req, res) => {
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
  
router.post("/signup-2", function(req, res) {
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
  
router.post('/login', (req, res, next) => {
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
  

module.exports = router;