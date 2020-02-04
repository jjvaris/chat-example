import React, { useState } from 'react';
import { useSocket } from './context/SocketContext';
import { Input, Heading } from '@chakra-ui/core';

function SelectUsername({ onSelect }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const socket = useSocket();

  return (
    <div
      style={{
        height: '100vh',
        display: 'grid'
      }}
    >
      <form
        autoComplete="off"
        style={{
          margin: 'auto'
        }}
        onSubmit={e => {
          e.preventDefault();
          if (!username) {
            return;
          }
          socket.register(username, (err, username) => {
            if (err) {
              setError(err);
            } else {
              onSelect(username);
            }
          });
        }}
      >
        <Heading mb="10" textAlign="center">
          ENTER
        </Heading>
        <Input
          id="username"
          type="text"
          value={username}
          name="username"
          placeholder="Select username..."
          autoComplete="none"
          size="lg"
          onChange={e => setUsername(e.target.value)}
        />
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}

export default SelectUsername;
