const { Schema, default: mongoose } = require('mongoose');

const chatSchema = Schema({
    data: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
    },
    time: {
        type: Date,
        required: true,
        default: Date.now,
    }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;