const express = require("express");
const router = express.Router();
const collection = require("../models/user");
const bcrypt = require('bcrypt');

const usernameBlackList = [
    'guys, help me out here'
]

router.post('/register', async (req,res) => {

    console.log("Headers:", req.headers['content-type']);
    console.log("Raw Body:", req.body);
    const {username, email, password, confirmPass} = req.body;
    const display_name = username

    // assuming user must be unique.
    // if user exist, redirect to login page

    //username checking
    if (password != confirmPass) {
        return res.render('register', {error: "Passwords do not match"});
    }
    if (username.length <= 2  || username.length >= 30) {
        return res.render('register', {error: "Error: Username must be 3-30 characters long"})
    }
    if ((/^[a-zA-z0-9_-]+&/.test(username))){
        return res.render('register', {error: "Error: Username can only contain letters, numbers, hyphens, and underscores"})
    }
    if (/[_-]{2,}/.test(username)){
        return res.render('register', {error: "Error: Username cannot have two or more consecutive special characters"})
    }
    if(/^[_-]|[_-]$/.test(username)){
        return res.render('register', {error: "Error: Username cannot start or end with special characters"})
    }


    try{
        // assuming we need to check if there's existing user...
        const lowerUser = username.toLowerCase()
        const existingUser = await collection.findOne({username: lowerUser});
        if(existingUser){
            console.log("User already registered");
            return res.render('register', {error: "Error: Username already exists"})
        }

        console.log("Registering:", req.body);
        bcrypt.genSalt(10, (err, salt) => {
            if(err) throw err;
            bcrypt.hash(password, salt, async (err, hash) => {
                if(err) throw err;
                try{
                    console.log(collection);
                    const newUser = await collection.create({
                        username,
                        display_name,
                        email,
                        password_hash: hash,
                        hash_algorithm: 'bcrypt'
                    });
                    console.log("you are now registered. login now!");
                    res.redirect('/');
                } catch(error){
                    console.error(error);
                    console.log('could not create user. Please try again');
                    res.redirect('/');
                }
            });
        });
    } catch(err){
        console.error(error);
        console.log('could not create user. Please try again');
        res.redirect('/register');
    }

})

router.post('/login', (req, res) =>{
    try {
        // const user = collection.collection({username: req.body.username, password: req.body.password});
        const { username, password } = req.body;
        console.log(user);
        if (user) {  
            console.log('logged in successfully');
            res.redirect("/"); // this part will redirect the user to the main page
        } else {
            console.log('did not login successfully');
            res.render("login", { title: "Login Account", error: "Invalid username or password" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
		

    }
})

router.post('/signout', (req,res) => {
    
})

module.exports = router