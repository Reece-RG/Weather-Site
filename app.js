const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const flash = require('connect-flash');
const https = require('https');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();
require('dotenv').config();
require("./config/passport.js")(passport);
const port = 3000;
const app = express();
mongoose.connect("mongodb://localhost:27017/clientDB", {useNewUrlParser: true});

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
 secret : 'secret',
 resave : true,
 saveUninitialized : true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req,res,next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error  = req.flash('error');
next();
});
app.use(express.static("public"));
app.use("/", require("./routes/clients.js"));


app.get("/", function(req, res){
  res.render("home");
});

app.post("/", function(req, res){
  var location = req.body.location;
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" + location + "&appid=" + process.env.API_KEY + "&units=metric";
    https.get(url, function(response){
      response.on("data", function(data){
        const weatherData = JSON.parse(data);
        console.log(weatherData);
        res.render("forecast", {weatherImg: weatherData.weather[0].icon, weatherLoc: weatherData.name, weatherNT: weatherData.sys.country, weatherDes: weatherData.weather[0].description, weatherTemp: weatherData.main.feels_like, weatherMin: weatherData.main.temp_min, weatherMax: weatherData.main.temp_max, weatherPres: weatherData.main.pressure, weatherHum: weatherData.main.humidity, weatherWind: weatherData.wind.speed});
      });
    });
});

app.listen(port, function(){
  console.log("The server is running locally on port " + port + ".");
});
