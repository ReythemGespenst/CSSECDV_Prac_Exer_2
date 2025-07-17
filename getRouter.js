const express = require('express')
const router = express.Router()
const {isUserLoggedIn} = require('./util')

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
})

router.get('/users', async (req, res) => {
    const username = req.cookies.username;
    if (!isUserLoggedIn(req)) {
        return res.redirect('/login');
    }

    try {
        const users = await User.find({}, '_id username'); 
        res.render('userlist', { username, users });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).send("Failed to load users");
    }
});

router.get('/users/:id', async (req, res) => {
    const username = req.cookies.username;
    if (!isUserLoggedIn(req)) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render('details', { username, user });
    } catch (err) {
        console.error("Error fetching user details:", err);
        res.status(500).send("Failed to load user details");
    }
});
module.exports = router