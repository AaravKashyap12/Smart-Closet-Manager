import React from 'react';

function ChatHeader() {
  return (
    <div className="chat-header">
      <div className="chat-title">
        <i className="fas fa-tshirt"></i>
        <h1>SmartCloset<span className="status-badge status-online">ONLINE</span></h1>
      </div>
      <div className="chat-controls">
        <button className="control-btn" title="Help Center">
          <i className="fas fa-question-circle"></i>
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;