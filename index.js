require('dotenv').config()

const express = require('express')
const session = require('express-session')

const app = express()
const MongoStore = require('connect-mongo')

const getRouters = require('./routes/getRouter')
const postRouters = require('./routes/postRouter')
app.use(express.static('css'))
app.use(express.static('js'))
app.set("view engine", "ejs")
app.use(express.urlencoded({extended: true}))

app.use("/", getRouters)
app.use("/post", postRouters)

/*
app.use(session({
    secret: "Change this please",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: 'mongodb+srv://roncajumban:MDvILUw2z8ocOJlS@cluster0.lf44nxb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'}),
    cookie: {
        maxAge: 1000*60,
        httpOnly: true
    }
}))
*/

app.listen(3000, function(req,res) {
    console.log("Listening at port 3000")
})