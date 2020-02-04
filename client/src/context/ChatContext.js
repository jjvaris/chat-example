import * as React from 'react';

const initialState = {
  messages: [],
  users: []
};

const ChatStateContext = React.createContext();
const ChatDispatchContext = React.createContext();

const NEW_MESSAGE = 'NEW_MESSAGE';
const INITIAL_STATE = 'INITIAL_STATE';
const USER_JOINED = 'USER_JOINED';
const USER_LEFT = 'USER_LEFT';

function newChatMessage(message) {
  return {
    type: NEW_MESSAGE,
    message
  };
}

function userJoined(user) {
  return {
    type: USER_JOINED,
    user
  };
}

function userLeft(user) {
  return {
    type: USER_LEFT,
    user
  };
}

function setInitialState(state) {
  return { type: INITIAL_STATE, state };
}

function reducer(state, action) {
  switch (action.type) {
    case INITIAL_STATE:
      return action.state;
    case NEW_MESSAGE:
      return { ...state, messages: [...state.messages, action.message] };
    case USER_JOINED:
      return { ...state, users: [...state.users, action.user] };
    case USER_LEFT:
      return {
        ...state,
        users: state.users.filter(user => user.socket !== action.user.socket)
      };
    default:
      console.log('unknown action', action);
      return state;
  }
}

function ChatProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <ChatStateContext.Provider value={state}>
      <ChatDispatchContext.Provider value={dispatch}>
        {children}
      </ChatDispatchContext.Provider>
    </ChatStateContext.Provider>
  );
}

function useChatState() {
  return React.useContext(ChatStateContext);
}

function useChatDispatch() {
  return React.useContext(ChatDispatchContext);
}

export {
  ChatProvider,
  useChatDispatch,
  useChatState,
  newChatMessage,
  setInitialState,
  userJoined,
  userLeft
};
