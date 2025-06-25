require('dotenv').config();

const mongoose = require('mongoose')

const uri = process.env.MONGO_URI

mongoose.connect(uri, {
    useNewURlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB Atlas Server"))
.catch(err => console.error("Failed to connect to server for error: ", err))