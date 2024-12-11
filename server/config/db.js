const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const connectDB = async() => {
    await mongoose.connect(dotenv.parsed.MONGO_URI);
    console.log('MongoDB Connected');
};

module.exports = connectDB;