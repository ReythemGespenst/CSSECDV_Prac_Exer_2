const express = require('express')
const router = express.Router()
const {isUserLoggedIn} = require('./util')
const { getUserRoles } = require('../helpers/UserRoleHelper')
const User = require('../models/user')

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


router.get('/dashboard', async (req,res) => {
	const username = req.cookies.username;
    if (!isUserLoggedIn(req)){
        return res.redirect('/login')
    }

    const user = await User.findOne({ username: username })
    const roles = await getUserRoles(user._id)

    res.render("dashboard", {
        username, roles 
        })
})



module.exports = router