const express = require("express")
const router = express.Router()

router.post('/register', (req,res) => {

})

router.post('/login', (req, res) =>{
    const {username, password} = req.body;

    console.log('Username: ', username)
    console.log('Password: ', password)

    res.redirect('/dashboard')
})

router.post('/signout', (req,res) => {
    
})

module.exports = router