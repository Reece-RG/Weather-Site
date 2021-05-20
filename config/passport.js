const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const Client = require("../models/client.js");

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({usernameField: "email"}, function(email, password, done){
      Client.findOne({email: email}, function(err, client){
        if(client){
          bcrypt.compare(password, client.password, function(err, isMatch){
            if (isMatch) {
              return done(null, client);
            } else {
              return done(null, false, {message: "password incorrect"});
            }
          });
        }
        if(!client){
          return done(null,false,{message : 'that email is not registered'});
        }
      });
    }));
  passport.serializeUser(function(client, done){
    done(null, client.id);
  });
  passport.deserializeUser(function(id, done){
    Client.findById(id, function(err, client){
      done (err, client);
    });
  });
};
