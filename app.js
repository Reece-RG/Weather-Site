const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const https = require('https');
require('dotenv').config();
const port = 3000;
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true})); //enable parsing of user inputs
app.use(express.static("public")); //make styling rendered

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
