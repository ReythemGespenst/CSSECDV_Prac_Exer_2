// require('dotenv').config()

const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose');
const collection = require("./models/user");

const app = express() 
const MongoStore = require('connect-mongo')

// connect to db atlas
// const dbURI = 'mongodb+srv://group2:MrsA0tzKYszunkr3@pe2.g9bjw1d.mongodb.net/?retryWrites=true&w=majority&appName=PE2';
const dbURI = 'mongodb+srv://group2:MrsA0tzKYszunkr3@pe2.g9bjw1d.mongodb.net/PE2?retryWrites=true&w=majority'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err));

const getRouters = require('./routes/getRouter')
const postRouters = require('./routes/postRouter');
// const { default: mongoose } = require('mongoose');

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