const { Schema, default: mongoose } = require('mongoose');

const usersSchema = Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
            type: String,
            required: true
    },
    connected: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const User = mongoose.model('User', usersSchema);
module.exports = User;