Project Title: Chat Application

Project Description:
A real-time chat application that allows users to communicate instantly. It supports user authentication, chat rooms, and dynamic messaging using WebSockets.

Features:
Real-time messaging with WebSockets.
User authentication and authorization.
Message persistence using MongoDB.

Tech Stack:
Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express.js
Database: MongoDB
Real-Time Communication: WebSockets

Setup Instructions:
Prerequisites:
Node.js (v22.2.0 or later)
npm (bundled with Node.js)
MongoDB server installed and running
Steps to run the project:

Clone the repository:
git clone https://github.com/konstantin978/Chat-Application.git
cd chat-app 

Install dependencies:
npm install  

Configure environment variables:
Create a .env file in the project root with the following details:
MONGO_URI=<your-mongodb-url>  
JWT_SECRET=<your-jwt-secret> 

Start the application:

Start the Backend server using:
npm run dev
The backend server will run on port 7938 by default.

Start the Frontend server using:
Open the client folder in Visual Studio Code.
Use the Live Server extension to start the frontend.
The frontend will run on port 5500 by default.
If you wish to use a different port for the frontend, make sure to configure CORS in the backend to allow cross-origin requests between the frontend and backend.
Open your browser and navigate to http://localhost:5500 to access the application.

Usage:

Sign up page:
Sign Up to create an account.

Homepage:
log in to start chatting.
