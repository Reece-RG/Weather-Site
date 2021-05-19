const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const Client = require("../models/client.js");
const https = require('https');
const {
  ensureAuthenticated
} = require("../config/auth.js");

router.get("/login", function(req, res) {
  res.render("login");
});

router.get("/signup", function(req, res) {
  res.render("signup");
});

router.get("/login2", function(req, res) {
  res.render("login2");
});

router.post("/login", function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login2',
    failureFlash: true,
  })(req, res, next);
});

router.post("/login2", function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login2',
    failureFlash: true,
  })(req, res, next);
});

router.post("/signup", function(req, res) {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  let errors = [];
  if (!newEmail || !newPassword) {
    errors.push({
      msg: "Please fill in all fields."
    });
  }
  if (newPassword.length < 6) {
    errors.push({
      msg: "Password needs to be at least 6 characters long."
    });
  }
  if (errors.length > 0) {
    res.render("signup2", {
      errors: errors,
      email: newEmail,
      password: newPassword
    });
    errors = [];
  } else {
    Client.findOne({
      email: newEmail
    }, function(err, client) {
      console.log(client);
      if (client) {
        errors.push({
          msg: "Email is already registered."
        });
        res.render("signup2", {
          errors: errors,
          email: newEmail,
          password: newPassword
        });
        errors = [];
      } else {
        bcrypt.hash(newPassword, 10, function(err, hash) {
          const newClient = new Client({
            email: newEmail,
            password: hash
          });
          Client.create(newClient, function(err) {
            if (!err) {
              req.flash('success_msg', 'You have now registered!');
              res.redirect("/login2");
            }
          });
        });
      }
    });
  }
});

router.get('/profile', ensureAuthenticated, function(req, res) {
  var idConnected = req.user.id;
  Client.findOne({
    _id: idConnected
  }, function(err, client) {
    if (client.city1 === undefined) {
      res.render('profile');
    } else {
      const url = "https://api.openweathermap.org/data/2.5/weather?q=" + client.city1 + "&appid=" + process.env.API_KEY + "&units=metric";
      https.get(url, function(response) {
        response.on("data", function(data) {
          const weatherData = JSON.parse(data);
          console.log(weatherData);
          res.render('profile2', {
            weatherImg: weatherData.weather[0].icon,
            weatherLoc: weatherData.name,
            weatherNT: weatherData.sys.country,
            weatherDes: weatherData.weather[0].description,
            weatherTemp: weatherData.main.feels_like,
            weatherMin: weatherData.main.temp_min,
            weatherMax: weatherData.main.temp_max,
            weatherPres: weatherData.main.pressure,
            weatherHum: weatherData.main.humidity,
            weatherWind: weatherData.wind.speed
          });
        });
      });
    }
  });
});


router.post('/profile', ensureAuthenticated, function(req, res) {
  Client.findOneAndUpdate({
    email: req.body.email
  }, {
    $set: {
      city1: req.body.city1
    }
  }, function(err, client) {});
  res.redirect('/profile');
});



router.get("/logout", function(req, res) {
  req.logout();
  req.flash('success_msg', 'Now logged out');
  res.redirect('/login2');
});

module.exports = router;
