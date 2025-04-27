import React from 'react';

function WelcomeMessage() {
  return (
    <div className="welcome-message">
      <div className="welcome-icon">
        <i className="fas fa-tshirt"></i>
      </div>
      <h2>Welcome to SmartCloset</h2>
      <p>Your intelligent wardrobe management assistant. I can help you organize your clothing, suggest
        outfits, track seasonal items, provide fashion advice, and manage your wardrobe inventory.</p>
    </div>
  );
}

export default WelcomeMessage;