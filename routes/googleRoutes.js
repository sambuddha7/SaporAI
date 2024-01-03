const express = require('express');
const router = express.Router();

const passport = require('passport');

router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
router.get('/auth/google/signup-2', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/goauth');
});

router.get("/goauth", function(req,res) {
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


module.exports = router;