const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render("login")
})


router.get('/register', (req, res) => {
    res.render("register", {error: null})
})


router.get('/dashboard', (req,res) => {
    res.render("dashboard")
})

module.exports = router