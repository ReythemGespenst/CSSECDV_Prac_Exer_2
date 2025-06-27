const express = require("express");
const router = express.Router();
const collection = require("../models/user");
const bcrypt = require('bcrypt');
const validator = require('validator');

const usernameBlackList = [
    'admin',
    'administrator',
    'root'
]
const passwordBlackList = [
    'password'
]

router.post('/register', async (req, res) => {
    const { username, email, password, confirmPass } = req.body;

    let usernameRaw = validator.trim(username);
    const usernameEscape = validator.escape(usernameRaw);
    const normalizedUsername = usernameEscape.toLowerCase();
    const display_name = usernameRaw;

    const emailRaw = validator.trim(email);
    const emailNormalized = validator.normalizeEmail(emailRaw, {all_lowercase: true});

    const passwordSanitized = validator.trim(password);
    const confirmPassSanitized = validator.trim(confirmPass);
    //username checking
    if (!usernameEscape) {
        return res.render('register', { error: "Error: Username is required" });
    }
    //3-30 char length
    if (usernameEscape.length < 3 || usernameEscape.length > 30) {
        return res.render('register', { error: "Error: Username must be 3-30 characters long" })
    }
    //only alphanumeric, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(usernameEscape)) {
        return res.render('register', { error: "Error: Username can only contain letters, numbers, hyphens, and underscores" });
    }
    //case-insensitive but store original - db maker
    //blacklist terms - wala na ata

    //admin name
    if (usernameBlackList.includes(usernameEscape)) {
        return res.render('register', { error: "Error: This username is not available" })
    }
    //dont have consecutive special characters
    if (/[_-]{2,}/.test(usernameEscape)) {
        return res.render('register', { error: "Error: Username cannot have two or more consecutive special characters" })
    }
    //dont start and end with special chars
    if (/^[_-]|[_-]$/.test(usernameEscape)) {
        return res.render('register', { error: "Error: Username cannot start or end with special characters" })
    }
    //dont have common variations of admin terms - wasnt given

    //store in lowercase but keep display_name - db maker

    //email checking
    //trim all leading and trailing whitespaces
    if (!emailNormalized || emailNormalized.length < 1) {
        return res.render('register', { error: "Error: Email address is required" });
    }
    //only 1 @
    if ((emailNormalized.match(/@/g) || []).length !== 1) {
        return res.render('register', { error: "Error: Please enter a valid email address" });
    }
    //cant go over 320 chars total
    if (emailNormalized.length > 320) {
        return res.render('register', { error: "Error: Email address must not exceed 320 characters" });
    }


    //right side cant be empty
    const emailParts = emailNormalized.split('@');
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

    //minimum 8 length
    if (passwordSanitized.length < 8) {
        return res.render('register', { error: "Error: Password must be at least 8 characters long" });
    }
    //maximum 128 length
    if (passwordSanitized.length > 128) {
        return res.render('register', { error: "Error: Password must not exceed 128 characters" });
    }
    //common passwords
    if (passwordBlackList.includes(passwordSanitized)) {
        return res.render('register', { error: "Error: Password is too common" });
    }
    //password not same as username
    if (passwordSanitized === usernameEscape) {
        return res.render('register', { error: "Error: Password cannot be the same as the username" });
    }

    //password not same as email
    if (passwordSanitized === emailParts[0]) {
        return res.render('register', { error: "Error: Password cannot be the same as the email" });
    }

    function hasSequentialCharacters(password) {
        const length = password.length;
        for (let i = 0; i < length - 4; i++) {
            const slice = password.slice(i, i + 5);
            if (isSequential(slice)) {
                return true;
            }
        }
        return false;
    }

    function isSequential(str) {
        const charCodes = str.split('').map(char => char.charCodeAt(0));
        const isIncreasing = charCodes.every((val, i, arr) => i === 0 || val === arr[i - 1] + 1);
        const isDecreasing = charCodes.every((val, i, arr) => i === 0 || val === arr[i - 1] - 1);
        return isIncreasing || isDecreasing;
    }

    //password sequential
    if (hasSequentialCharacters(passwordSanitized)) {
        console.log("Blocked due to sequential characters:", passwordSanitized);
        console.log("Regex test result:", /(\d{5,}|[a-z]{5,})/.test(passwordSanitized));
        console.log("Regex test result:", /(\d{5}|[a-z]{5})/.test(passwordSanitized));
        console.log("Regex test result:", /(\{5,}|[a-z]{5,})/.test(passwordSanitized));
        console.log("Regex test result:", hasSequentialCharacters(passwordSanitized));
        return res.render('register', { error: "Error: Password cannot contain sequential characters" });
    }

    if (/([a-zA-Z])\1{4,}/i.test(passwordSanitized)){
        return res.render('register', { error: "Error: Password cannot contain sequential characters" });
    }

    if (passwordSanitized !== confirmPassSanitized) {
        return res.render('register', { error: "Passwords do not match" });
    }




    try {
        // assuming we need to check if there's existing user...
        const existingUser = await collection.findOne({ username: normalizedUsername});
        if (existingUser) {
            return res.render('register', { error: "Error: Username already exists" })
        }

        const existingEmail = await collection.findOne({ email: emailNormalized});
        if (existingEmail) {
            return res.render('register', {error: "Error: Email already exists"});
        }

        bcrypt.genSalt(10, (err, salt) => {
            if (err) throw err;
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) throw err;
                try {
                    console.log(collection);
                    const newUser = await collection.create({
                        username: normalizedUsername,
                        display_name,
                        email: emailNormalized,
                        password_hash: hash,
                        hash_algorithm: 'bcrypt'
                    });
                    console.log("you are now registered");
					res.setHeader('Set-Cookie', `username=${newUser.display_name}; HttpOnly; Path=/; Max-Age=3600`);
                    return res.redirect('/');
                } catch (error) {
                    console.error(error);
                    console.log('could not create user. Please try again');
                    return res.render('register', {error: "Something went wrong, please try again."});
                }
            });
        });
    } catch (err) {
        console.error(error);
        console.log('could not create user. Please try again');
        res.redirect('/register');
    }

});

router.post('/login', async (req, res) => {
    try {
        // const user = collection.collection({username: req.body.username, password: req.body.password});
        const { username, password } = req.body;

        let usernameCheck = validator.trim(username);
        usernameCheck = validator.escape(username);

        let passwordCheck = validator.trim(password);

        const input = usernameCheck.toLowerCase()

        if(!input || !password){
            return res.render("login", {title: "Login account", error: "Username and password are required"});
        }

        const user = await collection.findOne({
            $or: [
                { username: input },
                { email: input }
            ]
        })

        if (!user) {
            return res.render('login', {title: "Login Account", error: "Invalid username or password"});
        }

        // if credentials match
        if (await bcrypt.compare(passwordCheck, user.password_hash)) {
            console.log('logged in successfully');
            res.setHeader('Set-Cookie', `username=${user.display_name}; HttpOnly; Path=/; Max-Age=3600`);
            res.redirect("/dashboard"); // this part will redirect the user to the main page
        } else {
            console.log('did not login successfully');
            res.render("login", { title: "Login Account", error: "Invalid username or password" });
        }
    } catch (error) {
        console.log(error);
        // res.status(500).send("Error: Username or password is incorrect");
        return res.render('login', { error: "Something went wrong, please try again" });
    }
})

router.post('/signout', (req, res) => {
    res.setHeader('Set-Cookie', `username=; HttpOnly; Path=/; Max-Age=0`);
    return res.redirect('/login');
    console.log('Username: ', username)
    console.log('Password: ', password)
	if (username === "test" && password === "1234") {
        res.json({ success: true })
    } else {
        res.json({ success: false, message: "Invalid username or password" })
    }

    //res.redirect('/dashboard')
	
})

/*
router.post('/login', async (req, res) => {
    const { username, password } = req.body

    try {
        const user = await User.findOne({ username })

        if (user && user.password === password) {
            // Optionally start session here
            res.json({ success: true })
        } else {
            res.json({ success: false, message: "Invalid username or password" })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Server error" })
    }
})*/
router.post('/signout', (req,res) => {
})




module.exports = router