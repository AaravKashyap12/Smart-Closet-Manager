import React, { useState } from 'react';

function InputArea({ onSendMessage }) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="input-area">
      <input 
        type="text" 
        className="input-field" 
        placeholder="Ask SmartCloset about your wardrobe..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button 
        className="input-btn" 
        id="send-btn" 
        title="Send Message"
        onClick={handleSend}
      >
        <i className="fas fa-paper-plane"></i>
      </button>
    </div>
  );
}

export default InputArea;