const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const { User } = require('../api-calls/db.js');



router.get("/", function(req, res) {

    if (req.isAuthenticated()) {
      User.findById(req.user.id).then((foundUser) => {
        if (foundUser) {
          var weight = foundUser.weight;
          const actualWeight = weight;
          const weightUnit = foundUser.weightUnit;
          if (weightUnit == "kgs") {
            weight = weight * 2.20462;
            weight = Math.round(weight);
          }
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
            maintenanceCalories -= 250;
          } else if (foundUser.goal == "WeightGain") {
            maintenanceCalories += 100;
          }
          foundUser.maintenance = maintenanceCalories;
          foundUser.save().then(()=> {
            res.render("user", {userName: foundUser.name, BMR: maintenanceCalories, Weight: actualWeight, Unit: weightUnit, gener: foundUser.recipeHistory.length});
          })
          .catch((err) => {
            console.log(err);
          });
          // res.render("user", {userName: foundUser.name, BMR: maintenanceCalories, Weight: weight});
        }
      }).catch(function(err) {
        console.log("user error");
      })
      
    } else {
        res.redirect("/login");
    }
  }); 


module.exports = router;