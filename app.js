const debug = require('debug')('chat:server');
const http = require('http');
const uuidv4 = require('uuid/v4');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  pingTimeout: 60000
});

app.use(logger('dev'));
app.use(express.json());
app.use('/', express.static(path.join(__dirname, 'client/build')));

let messages = [];
const users = new Map();

io.on('connection', socket => {
  socket.on('getRoom', (_, fn) =>
    fn({ messages, users: Array.from(users.values()) })
  );
  socket.on('getMessages', (_, fn) => fn(messages));
  socket.on('getUsers', (_, fn) => fn(users));
  socket.on('disconnect', reason => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      const msg = createMessage('server', `${user.username} left the channel.`);
      messages = [...messages, msg];
      socket.broadcast.emit('msg', msg);
      socket.broadcast.emit('leave', user);
    }
  });
  socket.on('leave', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      socket.broadcast.emit('leave', user);
    }
  });
  socket.on('register', (username, cb) => {
    for (let user of users.values()) {
      if (user.username === username) {
        return cb('Username already exists', null);
      }
    }
    const user = { username, socket: socket.id };
    users.set(socket.id, user);
    const msg = createMessage('server', `${username} joined the channel.`);
    messages = [...messages, msg];
    socket.broadcast.emit('msg', msg);
    socket.broadcast.emit('join', user);
    cb(null, username);
  });
  socket.on('msg', (msg, fn) => {
    messages = [...messages, msg];
    socket.broadcast.emit('msg', msg);
    if (fn && typeof fn === 'function') fn(msg);
  });
});

const port = process.env.PORT || '3010';
server.listen(port, () => debug(`listening on ${port}`));

function createMessage(user, message, channel = '#default') {
  return {
    id: uuidv4(),
    message,
    timestamp: new Date(),
    user,
    channel
  };
}
