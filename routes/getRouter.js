const express = require('express')
const router = express.Router()
const {isUserLoggedIn} = require('./util')
const collection = require("../models/user");

router.get('/', (req, res) => {
    res.redirect("/login")
})

router.get('/login', (req, res) => {
    if (!isUserLoggedIn(req)){
        return res.render("login", {error: null})
    }
    
    res.redirect('/dashboard')
})

router.get('/register', (req, res) => {
    res.render("register", {error: null})
})


router.get('/dashboard', (req,res) => {
	const username = req.cookies.username;
    if (!isUserLoggedIn(req)){
        return res.redirect('/login')
    }
   
    res.render("dashboard", {username })
});

router.get('/profile/:id', async (req,res) => {
    const username = req.cookies.username;
    if (!isUserLoggedIn(req)) {
        return res.redirect('/login');
    }
    console.log("user details: ", req.username);
    try {
        const user = await collection.findId(req.user._id);
        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render('profile', { username, email });
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).send("Failed to load user profile");
    }
});

router.get('/profile/edit', (req, res) => {
	try {
		const user = req.user;
		res.render('editProfile', { user });
	} catch (err) {
		console.error(err);
		res.status(500).send('Error loading profile');
	}
});

module.exports = router