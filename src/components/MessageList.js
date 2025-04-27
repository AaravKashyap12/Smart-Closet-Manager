import React from 'react';

function MessageList({ messages, typing }) {
  // Updated helper function to format message content
  const formatMessageContent = (message) => {
    if (typeof message !== 'string') return '';
    return message
      .replace(/\*\*(.*?)\*\*/g, '$1')   // remove **bold markers**
      .replace(/^\*\s*/gm, '')            // remove starting single *
      .replace(/\*/g, '')                 // remove remaining * if any
      .replace(/(^|\n)([A-Z][^:\n]{1,30}):/g, '$1<br><strong>$2:</strong>')  // make titles bold
      .replace(/^\d+\.\s*(.+?):/gm, '<br><strong>$1:</strong>') 
      .replace(/\n/g, '<br>')
      .replace(/(<br>\s*){3,}/g, '<br><br>');
  };

  return (
    <>
      {messages.map((message, index) => (
        <div key={index} className={`message ${message.sender}`}>
          <div className="avatar">
            <i className={`fas fa-${message.sender === 'bot' ? 'robot' : 'user'}`}></i>
          </div>
          <div>
            <div 
              className="message-content"
              dangerouslySetInnerHTML={{ __html: formatMessageContent(message.text) }}
            ></div>
            <div className="message-time">
              <i className="fas fa-check-double"></i> {message.time}
            </div>
          </div>
        </div>
      ))}
      
      {typing && (
        <div className="message bot typing-indicator">
          <div className="avatar">
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <div className="message-content">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MessageList;
