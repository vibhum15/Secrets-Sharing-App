//jshint esversion:6
require('dotenv').config();

const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption");

const app = express();

app.set("view engine", "ejs");
const port = "3000";
app.use(express.static("public"));

app.use(bodyparser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/user_of_secret");


const userschema = new mongoose.Schema(
    {
    username : String,
    password : String
    }
)

userschema.plugin(encrypt,{secret: process.env.secret,encryptedFields:['password']})

const table = new mongoose.model("user",userschema);



app.get("/", (req, res) => {
  res.render("home");
});

app.route("/login")
.get((req,res)=>{
    res.render("login");
})
.post((req,res) =>{
    const checkname = req.body.username;
    const checkpassword = req.body.password;


    table.findOne({username:checkname})
    .then((data)=>{
        if(data.password === checkpassword){
            res.render("secrets");
        }
        else{
            res.send("Email and password did not match with any registed user")
        }
    })
    .catch((err)=>{
        console.log(`error : ${err}`)
    })
    // table.findOne({username : checkname,password : checkpassword})
    // .then((data)=>{
    //     if(data){
    //         res.render("secrets")
    //     }
    //     else{
    //         console.log("unsucessfull login");
    //     }
    // })
    // .catch((err)=>{
    //     console.log(`error : ${err}`)
    // })

})




app.route("/register")
.get((req, res) => {
  res.render("register");
})
.post((req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const first = new table({
        username : username,
        password : password
    })
    first.save();
    console.log("User registered sucessfully")
    res.redirect("/");
})




app.listen(port, () => {
  console.log(`Server has started listening at ${port}`);
});
