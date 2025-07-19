const express = require('express')
const router = express.Router()
const { isUserLoggedIn } = require('./util')
const { getUserRoles } = require('../helpers/UserRoleHelper')
const User = require('../models/user')
const { requireRole, requirePermission } = require('../middleware/auth')

router.get('/', (req, res) => {
    res.redirect("/login")
})

router.get('/login', (req, res) => {
    if (!isUserLoggedIn(req)) {
        return res.render("login", { error: null })
    }

    res.redirect('/dashboard')
})

router.get('/register', (req, res) => {
    res.render("register", { error: null })
})


router.get('/dashboard', async (req, res) => {
    const username = req.cookies.username;

    if (!isUserLoggedIn(req)) {
        return res.redirect('/login')
    }

    const user = await User.findOne({ username: username })
    const roles = await getUserRoles(user._id)

    res.render("dashboard", {
        username: user.display_name, roles
    })
})

router.get('/profile', requirePermission('edit_profile'), async (req, res) => {
    const username = req.cookies.username;
    try {

        const user = await User.findOne({ username: username });
        const userId = user._id;

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render('profile', { user, editable: false });

    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).send("Failed to load user profile");
    }
});

router.get('/profile/edit', async (req, res) => {
    try {
        const username = req.cookies.username;
        const user = await User.findOne({ username });
        res.render('editProfile', { user, editable: true });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading profile');
    }
});


module.exports = router