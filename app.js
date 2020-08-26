//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// Level-4 Authentication : Replacing md5 with bcrypt
// Replacing Level-4 with Level-5 Authentication : Passport.js
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// Removal of DeprecationWarning: Unhandled promise rejections are deprecated
var somevar = false;
var PTest = function () {
    return new Promise(function (resolve, reject) {
        if (somevar === true)
            resolve();
        else
            reject();
    });
}
var myfunc = PTest();
myfunc.then(function () {
    // console.log("Promise Resolved");
}).catch(function () {
    // console.log("Promise Rejected");
});

// Setting up session
app.use(session({
  secret: 'Our little secret.',
  resave: false,
  saveUninitialized: false,
}));

// Setting Up Passport
app.use(passport.initialize());
app.use(passport.session());

// Mongoose Connection
mongoose.connect('mongodb://localhost:27017/userdb', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
// Mongoose Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// Setting Up passport-local-Mongoose
userSchema.plugin(passportLocalMongoose);
// Level-2 Authentication - Encryption of Users database
// Mongoose User model
const User = new mongoose.model("User",userSchema);
// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// To view the some of the homepage we need to render the app.get request

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
  res.render("secrets");
} else {
  res.redirect("/login");
}
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

// Level-5 Authentication
app.post("/register",function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err, user) {
  if (err) {
      console.log(err);
      res.redirect("/register");
   } else{
     passport.authenticate("local")(req,res,function(){
       res.redirect("/secrets");
     });
   }
  });
});



// Checking User login credentials validation in our database
app.post("/login",function(req,res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.logIn(user, function(err) {
     if (err) {
       console.log(err);
     }
  else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    });
  }
});

});
app.listen(3000,function(){
  console.log("Server Started at port 3000.");
});
