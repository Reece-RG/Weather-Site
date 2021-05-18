const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const https = require('https');
const mongoose = require('mongoose');
require('dotenv').config();
const port = 3000;
const app = express();
mongoose.connect("mongodb://localhost:27017/clientDB", {useNewUrlParser: true});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true})); //enable parsing of user inputs
app.use(express.static("public")); //make styling rendered
mongoose.connect("mongodb://localhost:27017/clientDB", {useNewUrlParser: true});

const clientSchema = new mongoose.Schema({
  email: String,
  password: String
});
const Client = mongoose.model("Client", clientSchema);

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

app.get("/login", function(req, res){
  res.render("login");
});

app.post("/login", function(req, res){
    const username = req.body.email;
    const password = req.body.password;
      Client.exists({email: username, password: password}, function(err, clients){
        if (err) {
        console.log(err);
        res.render("login");
        } else {
        console.log("Result : ", clients);
        res.render("home");
        }
    });
});

app.get("/signup", function(req, res){
  res.render("signup");
});

app.post("/signup", function(req, res){
  const client = new Client({
    email: req.body.email,
    password: req.body.password,
  });
    Client.exists({email: req.body.email, password: req.body.password}, function(err, clients){
      if (err) {
      console.log(err);
      } else {
          if (clients === false) {
            Client.create(client, function(err){
              if(!err){
                res.redirect("/");
              }
            });
          } else {
                res.redirect("/login");
            }
          }
    });
});

app.listen(port, function(){
  console.log("The server is running locally on port " + port + ".");
});
