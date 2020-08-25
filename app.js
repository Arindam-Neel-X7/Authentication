//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// Level-4 Authentication : Replacing md5 with bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;


const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// Mongoose Connection
mongoose.connect('mongodb://localhost:27017/userdb', {useNewUrlParser: true, useUnifiedTopology: true});
// Mongoose Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// Level-2 Authentication - Encryption of Users database



// Mongoose User model
const User = new mongoose.model("User",userSchema);

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

// Level-1 Authentication : Saving User credentials as plain text in our database.
app.post("/register",function(req,res){
  // Auto - Generating Hash
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    // Creating New User using the mongoose model
      const newUser = new User({
        email: req.body.username,
        password: hash    // Level-3 Authentication : HASHING upgraded to Level  4 : Salting and HASHING
      });

      newUser.save(function(err){
        if(err){
          console.log(err);
        }else{
          res.render("secrets");
        }
      });
});
});


// Checking User login credentials validation in our database
app.post("/login",function(req,res){
  const username = req.body.username;
  const password = req.body.password; // Level 3 Authentication : HASHING

  User.findOne({email: username},function(err,foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        bcrypt.compare(password,foundUser.password, function(err, result) {
            if(result === true){
                res.render("secrets");
            }
        });
        }
      }
      });
});


app.listen(3000,function(){
  console.log("Server Started at port 3000.");
});
