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

    if (!isUserLoggedIn(req)){
        return res.redirect('/login')
    }
    
    res.render("dashboard")
})

module.exports = router