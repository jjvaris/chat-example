import * as React from 'react';
import io from 'socket.io-client';

const SocketContext = React.createContext();

const socket =
  process.env.NODE_ENV === 'production' ? io() : io('http://localhost:3010');

socket.on('error', error => console.log(error));

const onMessage = fn => {
  socket.on('msg', message => fn(message));
  return () => socket.off('msg', fn);
};

const getMessages = fn =>
  socket.emit('getMessages', null, messages => fn(messages));

const sendMessage = (message, fn) => socket.emit('msg', message, fn);

const onJoin = fn => {
  socket.on('join', user => fn(user));
  return () => socket.off('join', fn);
};

const onLeave = fn => {
  socket.on('leave', user => fn(user));
  return () => socket.off('leave', fn);
};

const register = (username, cb) => socket.emit('register', username, cb);

const getRoom = fn => socket.emit('getRoom', null, fn);

function SocketProvider({ children }) {
  return (
    <SocketContext.Provider
      value={{
        onMessage,
        getMessages,
        sendMessage,
        onJoin,
        onLeave,
        register,
        getRoom
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

function useSocket() {
  return React.useContext(SocketContext);
}

export { SocketProvider, useSocket };
