//jshint esversion:6
require("dotenv").config();

const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const LocalStrategy = require("passport-local");

const saltRounds = 10;
const app = express();
const port = "3000";

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "Our Little Secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/user_of_secret");
// mongoose.set("useCreateIndex", true);

const userschema = new mongoose.Schema({
  username: String,
  password: String,
});

userschema.plugin(passportLocalMongoose);

const User = new mongoose.model("user", userschema);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const checkname = req.body.username;
    const checkpassword = req.body.password;
    
    const checkuser = new User({
      username: checkname,
      passport: checkpassword
    })
    req.login(checkuser,(err)=>{
      if(err){
        console.log(err);
      }
      else{
        passport.authenticate("local")(req,res,()=>{
          res.redirect("/secrets")
        })
      }
    })
    
  });

app.route("/secrets").get((req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.render("login");
  }
});

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    User.register({ username: req.body.username }, req.body.password)
      .then(() => {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/register");
      });
  });

app.route("/logout").get((req, res) => {
  res.redirect("/");
});
app.listen(port, () => {
  console.log(`Server has started listening at ${port}`);
});
