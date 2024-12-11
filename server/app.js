const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRouter = require('./routes/auth');
const cors = require('cors');
const ws = require('ws');
const url = require('node:url');
const User = require('./models/User');
const chatRouter = require('./routes/chat');
const cookieParser = require('cookie-parser');
const path = require('path');


const app = express();
const PORT = 7938;

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
	origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
	credentials: true,
}));

connectDB();

app.use('/auth', authRouter);
app.use('/chat', chatRouter);

app.post('/refresh', (req, res) => {
	const refreshToken = req.cookies['refreshToken'];

	if (!refreshToken) {
		return res.status(401).send({ message: 'Access Denied. No refresh token provided.' });
	}

	try {
		const decoded = jwt.verify(refreshToken, secretKey);

		const accessToken = jwt.sign({ user: decoded.user }, secretKey, { expiresIn: '1h' });

		const newRefreshToken = jwt.sign({ user: decoded.user }, secretKey, { expiresIn: '1d' });

		res.cookie('refreshToken', newRefreshToken, {
			httpOnly: true,
			sameSite: 'None',
			secure: true,
		})
			.header('Authorization', `Bearer ${accessToken}`)
			.send({ accessToken, user: decoded.user });

	} catch (error) {
		console.error('Error verifying refresh token:', error);
		return res.status(400).send({ message: 'Invalid refresh token.' });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on ${PORT} port.`);
});

// WEB SOCKET PART

const server = new ws.Server({
	port: 8000,
});

const clients = new Map();

server.on('connection', async (client, req) => {

	const { query } = url.parse(req.url, true);
	const { username } = query;

	try {
		const user = await User.findOne({ username });

		if (!user) {
			client.send('Unauthorized');
			client.close();
			return;
		}

		client.send(JSON.stringify({ message: `Welcome to the Green Chat ${user.name} jan`, author: 'Server', authorName: 'Server' }));
		clients.forEach(cl => cl.send(JSON.stringify({ message: `${user.name} connected to the chat`, author: 'Server', authorName: 'Server', requiresRender: true })))

		user.connected = true;
		await user.save();
		clients.set(user._id.toString(), client);

		client.on('message', async (message) => {
			const data = { message: `${message}`, author: user.username, authorName: user.name };
			clients.forEach(cl => {
				if (cl === client) return;
				cl.send(JSON.stringify(data))
			});
		});

		client.on('close', async () => {
			user.connected = false;
			await user.save();
			clients.delete(user._id.toString());
			clients.forEach(cl => cl.send(JSON.stringify({ message: `${user.name} leaved chat`, author: 'Server', authorName: 'Server', requiresRender: true })))
		});

	} catch (error) {
		client.send('Unauthorized');
		console.log(error);
		client.close();
	}
});

function cleanupOnClose() {
	User.find({ connected: true })
		.then(async (connectedUsers) => {
			for (const user of connectedUsers) {
				user.connected = false;
				await user.save();
			}
		})
		.catch((error) => {
			console.error('Error while updating user status on server close:', error);
		});
}

process.on('SIGINT', () => {
	console.log('Shutting down server...');
	cleanupOnClose();
	clients.forEach(cl => cl.close());
	server.close(() => {
		console.log('Server closed');
		process.exit(0);
	});
});
