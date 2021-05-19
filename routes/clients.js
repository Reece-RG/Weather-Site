const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Client = require("../models/client.js");

router.get("/login", function(req, res){
  res.render("login");
});

router.get("/signup", function(req, res){
  res.render("signup");
});

router.get("/users/login", function(req, res){
  res.render("login2");
});

router.post("/login", function(req, res, next){
});

router.post("/signup", function(req, res){
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  let errors = [];
  if(!newEmail || !newPassword){
    errors.push({msg: "Please fill in all fields."});
  }
  if(newPassword.length < 6) {
    errors.push({msg: "Password needs to be at least 6 characters long."});
  }
  if(errors.length > 0){
    res.render("signup2", {errors: errors, email: newEmail, password: newPassword});
    errors = [];
  } else {
    Client.findOne({email: newEmail}, function(err, client){
      console.log(client);
      if(client){
        errors.push({msg: "Email is already registered."});
        res.render("signup2", {errors: errors, email: newEmail, password: newPassword});
        errors = [];
      } else {
        bcrypt.hash(newPassword, 10, function(err, hash){
          const newClient = new Client({
            email: newEmail,
            password: hash
          });
          Client.create(newClient, function(err){
            if (!err) {
              req.flash('success_msg','You have now registered!');
              res.redirect("/users/login");
            }
          });
      });
    }
  });
}
});

router.get("/logout", function(req, res){
});

module.exports = router;
