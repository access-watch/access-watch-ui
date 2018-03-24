import React from 'react';

import { openChat, loadChat } from './chat';

import ChatSvg from '!svg-react-loader!./chat.svg'; //eslint-disable-line
import './ChatButton.scss';

class ChatButton extends React.Component {
  componentDidMount() {
    loadChat();
  }

  render = _ => (
    <div
      className="chat-button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <ChatSvg onClick={openChat} />
    </div>
  );
}

export default ChatButton;
