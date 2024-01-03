const express = require('express');
const router = express.Router();


router.get("/", function(request, response) {
    if (request.isAuthenticated()) {
      response.redirect("/user");
    } else {
      response.render("home");
    }
    
  });
router.get("/login", function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect("/user");
    } else {
      res.render("login", { error: '' });
    }
  });
router.get("/terms",function(req,res){
    res.render("terms");
  }) 
router.get("/signup", function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect("/user");
    } else {
      res.render("signup");
    }
    
  });
router.get("/signup-2", function(req, res) {
    if (req.isAuthenticated()) {
      res.render("signup-2");
    } else {
        res.redirect("/login");
    }
    // res.render("signup-2");
  });
router.get("/form-ai1", function(req, res) {
    if (req.isAuthenticated()) {
      res.render("form-ai1");
    } else {
      res.redirect("login");
    }
  });
router.get("/tr", function(req, res) {
    if (req.isAuthenticated()) {
      res.render("tr");
    } else {
      res.render("./login");
    }
  });
  
router.get("/tr1", function(req, res) {
    if (req.isAuthenticated()) {
      res.render("tr1");
    } else {
      res.render("./login");
    }
  });
router.get("/logout", function(req,res) {
    req.logout(function(err) {
        if (err) { console.log("logout-error") }
        res.redirect('/');
      });
  });

router.get("/result-2", function(req, res) {
    if (req.isAuthenticated()) {
      res.render("result-2", {result, last_ai});
      } else {
        res.redirect("login");
      }
});

router.get("/form-ai2", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("form-ai2");
      } else {
        res.redirect("login");
      }
});
router.get("/test", function(req,res) {
    res.render("test");
  })
module.exports = router;