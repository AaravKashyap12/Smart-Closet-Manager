import React from 'react';

function Suggestions({ onSuggestionClick }) {
  const suggestions = [
    "Outfit suggestions",
    "What should I wear today?",
    "Organize by color",
    "Add new clothes"
  ];

  return (
    <div className="suggestions">
      {suggestions.map((suggestion, index) => (
        <div 
          key={index} 
          className="suggestion-chip"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion}
        </div>
      ))}
    </div>
  );
}

export default Suggestions;