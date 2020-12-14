import React, { useEffect, useContext, useRef } from 'react';
import StateContext from '../contexts/StateContext';
import DispatchContext from '../contexts/DispatchContext';
import { useImmer } from 'use-immer';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
const socket = io('http://127.0.0.1:8080');

function Chat() {
  const chatField = useRef(null);
  const chatLog = useRef(null);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    fieldValue: '',
    chatMessages: [],
  });

  // use to focus the input whenever the chat window open
  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus();
      appDispatch({ type: 'clearUnreadChatCount' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState.isChatOpen]);

  // listing to the incoming messages from the servers
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from the socket server');
    });

    socket.on('chatFromServer', (message) => {
      setState((draft) => {
        draft.chatMessages.push(message);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // listening for the change in chatMessages either by user type or through incoming from server
  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    // we only want to increase the chat count if least on message is there (not on first render)
    // and if the chat window is not opened
    if (state.chatMessages.length && !appState.isChatOpen) {
      appDispatch({ type: 'incrementUnreadChatCount' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.chatMessages]);

  function handleFieldChange(e) {
    const value = e.target.value;
    setState((draft) => {
      draft.fieldValue = value;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Send message to chat server
    socket.emit('chatFromBrowser', {
      message: state.fieldValue,
      token: appState.user.token,
    });

    setState((draft) => {
      // Add message to state collection of messages
      draft.chatMessages.push({
        message: draft.fieldValue,
        username: appState.user.username,
        avatar: appState.user.avatar,
      });
      draft.fieldValue = '';
    });
  }

  return (
    <div
      id="chat-wrapper"
      className={
        'chat-wrapper shadow border-top border-left border-right ' +
        (appState.isChatOpen ? 'chat-wrapper--is-visible' : '')
      }
    >
      <div className="chat-title-bar bg-primary">
        Chat
        <span
          onClick={() => appDispatch({ type: 'closeChat' })}
          className="chat-title-bar-close"
        >
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username === appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img
                  className="chat-avatar avatar-tiny"
                  src={message.avatar}
                  alt="avatar"
                />
              </div>
            );
          }

          return (
            <div key={index} className="chat-other">
              <Link to={`/profile/${message.username}`}>
                <img
                  className="avatar-tiny"
                  src={message.avatar}
                  alt="avatar"
                />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}: </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={handleSubmit}
        id="chatForm"
        className="chat-form border-top"
      >
        <input
          value={state.fieldValue}
          onChange={handleFieldChange}
          ref={chatField}
          type="text"
          className="chat-field"
          id="chatField"
          placeholder="Type a message…"
          autoComplete="off"
        />
      </form>
    </div>
  );
}

export default Chat;
