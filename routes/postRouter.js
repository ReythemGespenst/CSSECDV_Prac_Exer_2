const express = require("express")
const router = express.Router()

router.post('/register', (req,res) => {

})

router.post('/login', (req, res) =>{
    const {username, password} = req.body;

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