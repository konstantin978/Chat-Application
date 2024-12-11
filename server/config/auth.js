const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const authJWT = (req, res, next) => {
    const accessToken = req.headers['authorization'];
    const refreshToken = req.cookies['refreshToken'];

    if (!accessToken && !refreshToken) {
        return res.status(401).send({ message: 'Access Denied. No token provided.' });
    }

    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken.split(' ')[1], dotenv.parsed.JWT_SECRET);
            req.user = decoded.user;
            return next();
        } catch (error) {
            console.log('Access token expired or invalid.');
        }
    }

    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, dotenv.parsed.JWT_SECRET);
            const newAccessToken = jwt.sign({ user: decoded.user }, dotenv.parsed.JWT_SECRET, { expiresIn: '1h' });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'None',
                secure: true,
            }).header('Authorization', `Bearer ${newAccessToken}`);

            req.user = decoded.user;
            return next();
        } catch (error) {
            return res.status(400).send({ message: 'Invalid Refresh Token.' });
        }
    }

    return res.status(401).send({ message: 'Access Denied. Token is required.' });
};

module.exports = authJWT;