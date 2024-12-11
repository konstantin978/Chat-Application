const { Router } = require('express');
const User = require('../models/User');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authRouter = Router();

authRouter.post('/signup', async (req, res) => {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
        return res.status(400).send({ message: 'All fields are required.' });
    }
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send({ message: 'Invalid email format.' });
    }
    // Validate password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).send({ message: 'Password must be at least 8 characters long and contain at least one letter and one number.' });
    }

    const existingUserByUsername = await User.findOne({ username });
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByUsername || existingUserByEmail) {
        return res.status(400).send({ message: 'User already exists.' });
    }

    try {
        const hashedPass = await bcrypt.hash(password, 10);
        const user = new User({ name, username, email, password: hashedPass });
        await user.save();
        res.status(200).send({ message: 'User registered Successfully!', status_code: 1 });

    } catch (error) {
        console.error(error);
        return res.status(400).send({ message: 'Something went Wrong' });
    }
});

authRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).send({ message: 'Invalid username' });
        }
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(400).send({ message: 'Invalid password' });
        }

        const payload = { id: user._id, username: user.username };
        const accessToken = jwt.sign(payload, dotenv.parsed.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign(payload, dotenv.parsed.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
        }).header('Authorization', `Bearer ${accessToken}`).send({
            message: 'Logged in successfully',
            status_code: 1,
            accessToken,
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send({ message: 'Server error', error });
    }
});



module.exports = authRouter;