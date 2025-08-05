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

app.use(cookieParser());
app.use(express.static('css'))
app.use(express.static('js'))
app.set("view engine", "ejs")
app.use(express.urlencoded({extended: true}))

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
    }),
    cookie: {
        maxAge: 1000 * 15,
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
    }
}));

app.use((req, res, next) => {
    if (req.session) {
        if (req.session.lastActivity && Date.now() - req.session.lastActivity > req.session.cookie.maxAge) {
            req.session.destroy(err => {
                if (err) {
                    console.error('Error destroying session:', err);
                    if (!res.headersSent) {
                        return res.status(500).send('Session destruction error.');
                    }
                }
                if (!res.headersSent) {
                    console.log('Redirecting 12');
                    return res.redirect('/login');
                }
            });
        } else {
            req.session.lastActivity = Date.now();
        }
    }
    next();
});

app.use("/", getRouters)
app.use("/post", postRouters)
app.use("/admin", requirePermission('admin_access'), adminRouters)

app.listen(3000, function(req,res) {
    console.log("Listening at port 3000")
})