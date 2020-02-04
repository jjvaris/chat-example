import React, { useState } from 'react';
import Chat from './Chat';
import SelectUsername from './SelectUsername';

function App() {
  const [username, setUsername] = useState('');
  return username ? (
    <Chat username={username} />
  ) : (
    <SelectUsername onSelect={n => setUsername(n)} />
  );
}

export default App;
