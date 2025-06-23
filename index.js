const express = require('express')
const app = express()

app.get('/', (req,res,next) => {
    console.log('test')
    res.render("Hi")
})

app.listen(3000)