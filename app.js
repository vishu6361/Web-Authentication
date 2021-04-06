//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Database (MongoDB Atlas) url
const urlDB = "mongodb+srv://vishu:Ican@seeyou27@cluster0.ytsqe.mongodb.net/secretsDB";
mongoose.connect(urlDB, {useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = "Thisisourlittlesecret.";
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);


app.route("/")
    .get((req, res)=>{
        res.render("home");
    });

app.route("/login")
    .get((req, res)=>{
        res.render("login");
    })
    .post((req, res)=>{
        const user = req.body.username;
        const pass = req.body.password;

        User.findOne({email: user}, (err, found)=>{
            if(!err){
                if(found.password !== pass){
                    console.log("Wrong Credentials");
                    res.redirect("/login");
                } else {
                    console.log("Successful login.");
                    res.redirect("/secrets");
                }
            }
        });
    });

app.route("/register")
    .get((req, res)=>{
        res.render("register");
    })
    .post((req, res)=>{
        const user = req.body.username;
        const pass = req.body.password;
        const item = new User({
            email: user,
            password: pass
        });

        User.findOne({email: user}, (err, found)=>{
            if(!err){
                if(!found){
                    item.save(err=>{
                        if(err) console.log(err);
                        else{
                            console.log("Successfully Registered");
                            res.render("secrets");
                        }
                    });
                } else {
                    console.log("Username already in use.");
                    res.redirect("/register");
                }
            }
        });

    });

app.route("/secrets")
    .get((req, res)=>{
        res.render("secrets");
    })



app.listen(5000, ()=>{
    console.log("Server running on port 5000.");
});
