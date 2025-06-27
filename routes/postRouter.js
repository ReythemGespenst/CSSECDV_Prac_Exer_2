const express = require("express");
const router = express.Router();
const collection = require("../models/user");
const bcrypt = require('bcrypt');

const usernameBlackList = [
    'admin',
    'administrator',
    'root'
]
const passwordBlackList = [
    'password'
]

router.post('/register', async (req, res) => {

    console.log("Headers:", req.headers['content-type']);
    console.log("Raw Body:", req.body);
    const { username, email, password, confirmPass } = req.body;
    const display_name = username

    usernameCheck = username.trim();
    //username checking
    if (usernameCheck === '') {
        return res.render('register', { error: "Error: Username is required" });
    }
    //3-30 char length
    if (usernameCheck.length < 3 || usernameCheck.length > 30) {
        return res.render('register', { error: "Error: Username must be 3-30 characters long" })
    }
    //only alphanumeric, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(usernameCheck)) {
        return res.render('register', { error: "Error: Username can only contain letters, numbers, hyphens, and underscores" });
    }
    //case-insensitive but store original - db maker
    //blacklist terms - wala na ata

    //admin name
    if (usernameBlackList.includes(usernameCheck)) {
        return res.render('register', { error: "Error: This username is not available" })
    }
    //dont have consecutive special characters
    if (/[_-]{2,}/.test(usernameCheck)) {
        return res.render('register', { error: "Error: Username cannot have two or more consecutive special characters" })
    }
    //dont start and end with special chars
    if (/^[_-]|[_-]$/.test(usernameCheck)) {
        return res.render('register', { error: "Error: Username cannot start or end with special characters" })
    }
    //dont have common variations of admin terms - wasnt given

    //store in lowercase but keep display_name - db maker




    emailCheck = email.trim()
    //email checking
    //trim all leading and trailing whitespaces
    if (emailCheck === '') {
        return res.render('register', { error: "Error: Email address is required" });
    }
    //only 1 @
    if ((emailCheck.match(/@/g) || []).length !== 1) {
        return res.render('register', { error: "Error: Please enter a valid email address" });
    }

    //right side cant be empty
    const emailParts = emailCheck.split('@');
    if (emailParts.length !== 2 || emailParts[1].trim() === '') {
        return res.render('register', { error: "Error: Please enter a valid email address" });
    }

    //left side should only be 1-64 chars
    if (emailParts[0].length < 1 || emailParts[0].length > 64) {
        return res.render('register', { error: "Error: The part before '@' must be between 1 and 64 characters" });
    }

    //only alphanumeric, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(emailParts[0])) {
        return res.render('register', { error: "Error: Please enter a valid email address" });
    }
    //lower case email in storage - db maker

    //cant go over 320 chars total
    if (emailCheck.length > 320) {
        return res.render('register', { error: "Error: Email address must not exceed 320 characters" });
    }


    //password validation

    passwordCheck = password.trim()
    confirmPassCheck = confirmPass.trim()

    //minimum 8 length
    if (passwordCheck.length < 8) {
        return res.render('register', { error: "Error: Password must be at least 8 characters long" });
    }
    //maximum 128 length
    if (passwordCheck.length > 128) {
        return res.render('register', { error: "Error: Password must not exceed 128 characters" });
    }
    //common passwords
    if (passwordBlackList.includes(passwordCheck)) {
        return res.render('register', { error: "Error: Password is too common" });
    }
    //password not same as username
    if (passwordCheck === usernameCheck) {
        return res.render('register', { error: "Error: Password cannot be the same as the username" });
    }

    //password not same as email
    if (passwordCheck === emailParts[0]) {
        return res.render('register', { error: "Error: Password cannot be the same as the email" });
    }

    //password sequential
    if (/(\d{3,}|[a-z]{3,})/.test(passwordCheck)) {
        return res.render('register', { error: "Error: Password cannot contain sequential characters" });
    }

    if (password !== confirmPass) {
        return res.render('register', { error: "Passwords do not match" });
    }




    try {
        // assuming we need to check if there's existing user...
        const lowerUser = username.toLowerCase()
        const existingUser = await collection.findOne({ username: lowerUser });
        if (existingUser) {
            console.log("User already registered");
            return res.render('register', { error: "Error: Username already exists" })
        }

        console.log("Registering:", req.body);
        bcrypt.genSalt(10, (err, salt) => {
            if (err) throw err;
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) throw err;
                try {
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
                } catch (error) {
                    console.error(error);
                    console.log('could not create user. Please try again');
                    res.redirect('/');
                }
            });
        });
    } catch (err) {
        console.error(error);
        console.log('could not create user. Please try again');
        res.redirect('/register');
    }

})

router.post('/login', async (req, res) => {
    try {
        // const user = collection.collection({username: req.body.username, password: req.body.password});
        const { username, password } = req.body;

        const input = username.trim().toLowerCase()
        const user = await collection.findOne({
            $or: [
                { username: input },
                { email: input }
            ]
        })

        // if credentials match
        if (await bcrypt.compare(password, user.password_hash)) {
            console.log('logged in successfully');
            res.setHeader('Set-Cookie', `username=${user.username}; HttpOnly; Path=/; Max-Age=3600`);
            res.redirect("/dashboard"); // this part will redirect the user to the main page
        } else {
            console.log('did not login successfully');
            res.render("login", { title: "Login Account", error: "Invalid username or password" });
        }
    } catch (error) {
        console.log(error);
        // res.status(500).send("Error: Username or password is incorrect");
        return res.render('login', { error: "Error: Username or password is incorrect" })
    }
})

router.post('/signout', (req, res) => {
    res.setHeader('Set-Cookie', `username=; HttpOnly; Path=/; Max-Age=0`);
    return res.redirect('/login');
})




module.exports = router