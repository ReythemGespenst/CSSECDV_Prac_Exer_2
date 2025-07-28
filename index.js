require('dotenv').config()
require('./db')

const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose');
const collection = require("./models/user");
const app = express() 
const MongoStore = require('connect-mongo')
const cookieParser = require('cookie-parser');
const getRouters = require('./routes/getRouter')
const postRouters = require('./routes/postRouter');
const adminRouters = require('./routes/adminRouter');
const { requirePermission } = require('./middleware/auth');
// const { default: mongoose } = require('mongoose');

app.use(cookieParser());
app.use(express.static('css'))
app.use(express.static('js'))
app.set("view engine", "ejs")
app.use(express.urlencoded({extended: true}))

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret', // Use a secure secret in production
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // MongoDB connection string
        collectionName: 'sessions',
    }),
    cookie: {
        maxAge: 1000 * 60 * 15, // 15 minutes session timeout
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
    }
}));

app.use((req, res, next) => {
    if (req.session) {
        if (req.session.lastActivity && Date.now() - req.session.lastActivity > 1000 * 60 * 15) {
            req.session.destroy(err => {
                if (err) console.error('Error destroying session:', err);
                return res.redirect('/login');
            });
        } else {
            req.session.lastActivity = Date.now(); // Update last activity timestamp
        }
    }
    next();
});

app.use("/", getRouters)
app.use("/post", postRouters)
app.use("/admin", requirePermission('admin_access'), adminRouters)

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