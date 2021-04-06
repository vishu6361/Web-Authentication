//jshint esversion:6
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Database (MongoDB Atlas) url
const urlDB = "mongodb+srv://"+process.env.MONGO_USER+":"+process.env.MONGO_PASS+"@cluster0.ytsqe.mongodb.net/secretsDB";
mongoose.connect(urlDB, {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route("/")
    .get((req, res)=>{
        res.render("home");
    });

app.route("/login")
    .get((req, res)=>{
        res.render("login");
    })
    .post((req, res)=>{
        const user = new User({
            username: req.body.username,
            password: req.body.password
        })
        req.logIn(user, (err)=>{
            if(err) console.log(err);
            else{
                passport.authenticate("local")(req, res, ()=>{
                    res.redirect("/secrets");
                });
                console.log("Successful login!");
            }
        })

    });

app.route("/register")
    .get((req, res)=>{
        res.render("register");
    })
    .post((req, res)=>{
        const user = req.body.username;
        const pass = req.body.password;
        User.register({username: user}, pass, (err, user)=>{
            if(err){
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, ()=>{
                    res.redirect("/secrets");
                });
            }
        })

    });

app.get("/logout", (req, res)=>{
    req.logOut();
    console.log("Logout Successful!");
    res.redirect("/");
})

app.route("/secrets")
    .get((req, res)=>{
        if (req.isAuthenticated()){
            res.render("secrets");
        } else {
            console.log("Login First");
            res.redirect("/login");
        }
    });



app.listen(5000, ()=>{
    console.log("Server running on port 5000.");
});
