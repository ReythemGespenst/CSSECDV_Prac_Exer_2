const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        maxlength: 30,
        lowercase: true,
        trim: true,
    },
    display_name: {
        type: String,
        required: true,
        maxlength: 30,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 320,
        lowercase: true, 
        trim: true,
    },
    password_hash: {
        type: String,
        required: true,
        maxlength: 255,
    },
    hash_algorithm: {
        type: String,
        default: 'bcrypt',
        required: true
    },
    last_login: {
        type: Date,
        default: null
    }
},
{
    timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
});

module.exports = mongoose.model('User', userSchema)