const port = 7938;

document.getElementById('signup-form')?.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    fetch(`http://localhost:${port}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status_code === 1) {
                document.querySelector('.success-msg').style.display = 'block';
            } else {
                document.querySelector('.success-msg').style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    fetch(`http://localhost:${port}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(res => {
            if (res.status_code === 1) {

                localStorage.setItem('token', res.accessToken);
                document.querySelector('.error_login').style.display = 'none';


                const wsUrl = `ws://localhost:8000?username=${data.username}`;
                let socket = new WebSocket(wsUrl);

                document.getElementById('send-form').addEventListener('submit', function (event) {
                    event.preventDefault();
                });
                
                const messageInput = document.getElementById('message');
                const sendButton = document.getElementById('send-btn');
                
                sendButton.addEventListener('click', function () {
                    const message = messageInput.value;
                    if(message){
                
                    if (message && socket.readyState === WebSocket.OPEN) {
                        socket.send(message);
                        displayMessage(`You: ${message}`);
                        messageInput.value = '';
                    }
                    getAllActive();
                
                    const messageData = {
                        data: message,
                        authorUsername: data.username,
                    };
                    sendMessage(messageData);
                }
                });
                

                socket.onopen = function () {
                    setTimeout(() => {
                        getAllActive();
                    }, 50);

                    fetchMessages(data);
                };

                socket.onmessage = function (event) {
                    const response = JSON.parse(event.data);
                    const username = response.author;
                    const name = response.authorName;
                    const render = response.requiresRender;

                    if (username === 'Server') {
                        displayMessage(`${response.message}`, true, true);
                    } else {
                        if (username === response.username) {
                            displayMessage(response.message, false);
                        } else {
                            displayMessage(`${name}: ${response.message}`, true);
                        }
                    }

                    if (render) {
                        getAllActive();
                    }
                };

                socket.onerror = function (error) {
                    displayMessage(`WebSocket error: ${error.message}`, true, true, true);
                };

                socket.onclose = function () {
                    displayMessage('Connection closed', true, true, true);
                };

                document.querySelector('.container').style.display = 'none';
                document.querySelector('.chat-section').style.display = 'flex';
            } else {
                document.querySelector('.error_login').style.display = 'block';
            }
        })
        .catch(error => console.error('Error:', error));
});

function displayMessage(message, isFromServer = false, isServer = false, isError = false) {
    const chatBox = document.querySelector('.main-chat');

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    const messageDiv = document.createElement('div');
    messageDiv.classList.add(isServer ? 'server-default' : isFromServer ? 'server' : 'user');
    messageDiv.classList.add(isError ? 'error' : 'message');

    if (!isFromServer && !isServer) {
        const senderDiv = document.createElement('p');
        const messageContent = document.createElement('p');

        messageContent.innerText = message.split(':')[1];
        messageContainer.classList.add('user-access');
        messageContent.classList.add('user-content');

        senderDiv.classList.add('sender');
        senderDiv.innerText = 'You';

        messageContainer.appendChild(senderDiv);
        messageDiv.appendChild(messageContent);
    } else if (isFromServer && !isServer) {
        const senderDiv = document.createElement('p');
        const messageContent = document.createElement('p');

        senderDiv.classList.add('sender');
        senderDiv.innerText = message.split(':')[0];

        messageContent.innerText = message.split(':')[1];
        messageContainer.classList.add('server-access');
        messageContent.classList.add('server-content');

        messageContainer.appendChild(senderDiv);
        messageDiv.appendChild(messageContent);
    } else if (isFromServer && isServer) {
        messageDiv.textContent = message;
    }

    messageContainer.appendChild(messageDiv);
    chatBox.appendChild(messageContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function renderMessages(msgs, data) {
    msgs.forEach(msg => {
        if (msg.author.username == data.username) displayMessage('You:' + msg.data, false);
        else displayMessage(`${msg.author.name}:${msg.data}`, true);
    });
}

function renderUsers(data) {
    const peopleDiv = document.querySelector('.people');
    peopleDiv.innerHTML = '';
    data.forEach(user => showUser(user));
}

function showUser(user) {
    const peopleDiv = document.querySelector('.people');
    const userDiv = document.createElement('div');
    userDiv.classList.add('active-user');
    userDiv.textContent = user.name;
    peopleDiv.appendChild(userDiv);
}

function getAllActive() {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:${port}/chat/get-all-active`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
    })
        .then(response => {
            if (response.status === 401) {
                refreshToken();
            } else {
                return response.json();
            }
        })
        .then(data => renderUsers(data));
}

function fetchMessages(data) {
    fetch(`http://localhost:${port}/chat/get-all-messages`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include'
    })
        .then(response => response.json())
        .then(msg => renderMessages(msg, data));
}

function sendMessage(messageData) {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:${port}/chat/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(messageData),
    })
        .then(response => response.json())
        .then(res => console.log('Message sent', res));
}

function refreshToken() {
    fetch(`http://localhost:${port}/refresh`, {
        method: 'POST',
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Refresh failed');
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('token', data.accessToken);
        })
        .catch(error => console.error('Error refreshing token:', error));
}