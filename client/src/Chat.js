import React, { useState, useEffect } from 'react';
import uuidv4 from 'uuid/v4';
import {
  useChatDispatch,
  useChatState,
  newChatMessage,
  setInitialState,
  userJoined,
  userLeft
} from './context/ChatContext';
import { useSocket } from './context/SocketContext';
import { Button, Text, Input, Box } from '@chakra-ui/core';

function Chat({ username }) {
  const [message, setMessage] = useState('');
  const dispatch = useChatDispatch();
  const { messages, users } = useChatState();
  const socket = useSocket();
  const chatRef = React.useRef(null);

  useEffect(() => {
    const eventHandlers = [
      socket.onMessage(message => dispatch(newChatMessage(message))),
      socket.onJoin(user => dispatch(userJoined(user))),
      socket.onLeave(user => dispatch(userLeft(user)))
    ];
    socket.getRoom(room => dispatch(setInitialState(room)));
    return () => {
      eventHandlers.forEach(unsubscribe => unsubscribe());
    };
  }, [socket, dispatch]);

  useEffect(() => chatRef.current.scrollIntoView(), [messages]);

  return (
    <div
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto 40px',
        padding: '10px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '4fr 1fr',
          overflowY: 'auto'
        }}
      >
        <Box overflow="auto" m="5">
          {[...messages]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map(m => (
              <Text
                fontSize="xs"
                key={m.id}
              >{`[${m.user}]: ${m.message}`}</Text>
            ))}
          <div ref={chatRef} />
        </Box>
        <Box
          overflow="auto"
          p="5"
          borderLeft="1px"
          style={{ borderLeftColor: 'lightgray' }}
        >
          {users.map(u => (
            <Text fontSize="m" key={u.socket}>
              {u.username}
            </Text>
          ))}
        </Box>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          const msg = createMessage(username, message, '#default');
          socket.sendMessage(msg);
          dispatch(newChatMessage(msg));
          setMessage('');
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: '7fr 1fr 2fr',
          gridColumnGap: '10px',
          marginLeft: '1.25rem',
          marginRight: '1.25rem'
        }}
      >
        <Input
          placeholder="Write message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        ></Input>
        <Button variantColor="green" type="submit" disabled={!message}>
          Send
        </Button>
      </form>
    </div>
  );
}

function createMessage(user, message, channel) {
  return {
    id: uuidv4(),
    message,
    timestamp: new Date(),
    user,
    channel
  };
}

export default Chat;
