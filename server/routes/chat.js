const Chat = require("../models/Chat");
const User = require("../models/User");
const { Router } = require('express');
const authJWT = require('../config/auth');

const chatRouter = Router();

chatRouter.get('/get-all-active', authJWT, async (req, res) => {
    const result = await User.find({ connected: true });
    res.send(result);
});

chatRouter.get('/get-all-messages', authJWT, async (req, res) => {
    try {
        const result = await Chat.find()
            .populate('author', 'username name')
            .exec();
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

chatRouter.post('/send', authJWT, async (req, res) => {
    const { data, authorUsername } = req.body;
    const author = await User.findOne({ username: authorUsername });

    if (!author) return res.status(400).send({ message: "User Not Found" });

    const chatMessage = new Chat({ data, author: author._id });
    await chatMessage.save();

    res.status(200).send({ message: 'Message Saved Successfully' });
});

module.exports = chatRouter;
