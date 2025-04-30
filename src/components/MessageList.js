import React from 'react';

function MessageList({ messages, typing }) {
  // Updated helper function to format message content
  const formatMessageContent = (message) => {
    if (typeof message !== 'string') return '';
  
    return message
      // Bold labels like "Tops:", "Shoes:" etc.
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
      // Convert markdown-style lists into HTML list elements
      .replace(/(?:^|\n)[*-]\s+(.*?)(?=\n|$)/g, '<li>$1</li>')
  
      // Wrap <li> elements inside <ul>
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
  
      // Replace line breaks with <br>, avoiding inside <ul>
      .replace(/\n/g, '<br>')
      .replace(/(<ul>.*?)<br>(.*?<\/ul>)/gs, '$1$2')
  
      // Reduce triple or more <br> to just double
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
