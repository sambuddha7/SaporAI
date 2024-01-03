const express = require('express');
const router = express.Router();

const { User } = require('../api-calls/db.js');

router.get("/settings", function(req,res) {
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
  })

router.post('/update', function(req, res) {
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

  module.exports = router;