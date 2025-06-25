const express = require("express");
const router = express.Router();
const collection = require("../models/user");
const bcrypt = require('bcryptjs');

router.post('/register', (req,res) => {

    console.log("Headers:", req.headers['content-type']);
    console.log("Raw Body:", req.body);
    const {username, email, password, confirmPass} = req.body;

    // assuming user must be unique.
    // if user exist, redirect to login page
    // res.redirect('login');
    try{
        // assuming we need to check if there's existing user...
        // const existingUser = await collection.findOne({username});
        // if(existingUser){
        //     console.log("User already registered");
        // }
        console.log("Registering:", req.body);
        bcrypt.genSalt(10, (err, salt) => {
            if(err) throw err;
            bcrypt.hash(password, salt, async (err, hash) => {
                if(err) throw err;
                try{
                    console.log(collection);
                    const newUser = await collection.create({
                        username,
                        password: hash
                    });
                    console.log("you are now registered. login now!");
                    res.redirect('/login');
                } catch(error){
                    console.error(error);
                    console.log('could not create user. Please try again');
                    res.redirect('/register');
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