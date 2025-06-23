const express = require('express')
const app = express()

app.set("view engine", "ejs")

app.get('/', (req,res,next) => {
    console.log('test')
    res.render("login")
})

app.listen(3000)
console.log("Listening at port 3000")