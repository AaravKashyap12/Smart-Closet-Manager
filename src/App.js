// App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [wardrobe, setWardrobe] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showItemEditor, setShowItemEditor] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showWardrobeView, setShowWardrobeView] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [typing, setTyping] = useState(false);
  const messagesContainerRef = useRef(null);

  const GEMINI_API_KEY = "AIzaSyC-tq48I4knEQNmfB4achMNZWINPsH5E9w";
  const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  const WEATHER_API_KEY = "e20a877c9a2e5fba787b993f3c8faf77";

  useEffect(() => {
    const savedWardrobe = localStorage.getItem('wardrobe');
    if (savedWardrobe) {
      setWardrobe(JSON.parse(savedWardrobe));
      setMessages([
        {
          text: "Hello! I'm SmartCloset, your personal wardrobe assistant. How can I help you organize your closet today?",
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      setShowSetup(true);
    }
  }, []);

  useEffect(() => {
    if (wardrobe) {
      localStorage.setItem('wardrobe', JSON.stringify(wardrobe));
    }
  }, [wardrobe]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (text, sender) => {
    setMessages(prevMessages => [
      ...prevMessages,
      {
        text,
        sender,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSetupComplete = (initialWardrobe) => {
    setWardrobe(initialWardrobe);
    setShowSetup(false);
    addMessage(
      "Hello! I'm SmartCloset, your personal wardrobe assistant. I see you've set up your wardrobe. How can I help you today?",
      'bot'
    );
  };

  const handleAddItem = (category, itemName) => {
    if (!wardrobe[category]) {
      addMessage(`⚠️ Category "${category}" doesn't exist.`, 'bot');
      return;
    }

    setWardrobe(prev => ({
      ...prev,
      [category]: [...prev[category], itemName]
    }));
    addMessage(`✅ Added "${itemName}" to ${category}.`, 'bot');
  };

  const handleEditItem = (oldItem, newItem, category) => {
    const index = wardrobe[category].findIndex(item => item === oldItem);
    if (index === -1) {
      addMessage(`⚠️ Couldn't find "${oldItem}" in ${category}.`, 'bot');
      return;
    }

    setWardrobe(prev => {
      const updated = [...prev[category]];
      updated[index] = newItem;
      return {
        ...prev,
        [category]: updated
      };
    });
    addMessage(`✏️ Updated "${oldItem}" to "${newItem}" in ${category}.`, 'bot');
  };

  const handleRemoveItem = (itemName, category) => {
    const index = wardrobe[category].findIndex(item => item === itemName);
    if (index === -1) {
      addMessage(`⚠️ Couldn't find "${itemName}" in ${category}.`, 'bot');
      return;
    }

    setWardrobe(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
    addMessage(`🗑️ Removed "${itemName}" from ${category}.`, 'bot');
  };

  const handleAddCategory = (categoryName) => {
    if (wardrobe[categoryName]) {
      addMessage(`⚠️ Category "${categoryName}" already exists.`, 'bot');
      return;
    }

    setWardrobe(prev => ({
      ...prev,
      [categoryName]: []
    }));
    addMessage(`📂 Created new category "${categoryName}".`, 'bot');
  };

  const handleRemoveCategory = (categoryName) => {
    if (!wardrobe[categoryName]) {
      addMessage(`⚠️ Category "${categoryName}" doesn't exist.`, 'bot');
      return;
    }

    setWardrobe(prev => {
      const newWardrobe = { ...prev };
      delete newWardrobe[categoryName];
      return newWardrobe;
    });
    addMessage(`🗑️ Removed category "${categoryName}" and all its items.`, 'bot');
  };

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      } else {
        navigator.geolocation.getCurrentPosition(
          pos => resolve(pos.coords),
          err => reject("Location access denied")
        );
      }
    });
  };

  const getWeatherByCoords = async (lat, lon) => {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`);
      const data = await res.json();

      const condition = data.weather[0].main.toLowerCase();
      const description = data.weather[0].description;
      const temp = data.main.temp;
      const city = data.name;

      const emojiMap = {
        clear: "☀️",
        clouds: "☁️",
        rain: "🌧️",
        drizzle: "🌦️",
        thunderstorm: "⛈️",
        snow: "❄️",
        mist: "🌫️",
        fog: "🌫️",
        haze: "🌫️"
      };

      const emoji = emojiMap[condition] || "🌤️";
      return `${emoji} The weather in ${city} is ${description} with a temperature of ${temp}°C.`;
    } catch (err) {
      console.error("Weather fetch error:", err);
      return "🌍 Weather data is currently unavailable.";
    }
  };

  const getGeminiResponse = async (userMessage) => {
    const prompt = `You are SmartCloset, an AI wardrobe assistant.\nWardrobe: ${JSON.stringify(wardrobe)}\nUser: ${userMessage}`;
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond.";
  };

  const askGeminiForCategory = async (itemName) => {
    const prompt = `Classify the item below into one of these: ${Object.keys(wardrobe).join(', ')}.\nItem: ${itemName}\nCategory:`;
    try {
      const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
      return Object.keys(wardrobe).includes(result) ? result : null;
    } catch (err) {
      console.error("Gemini Category Error:", err);
      return null;
    }
  };

  const showCategoryItems = (category) => {
    const items = wardrobe[category] || [];
    const itemsList = items.map(i => `• ${i}`).join('<br>');
    addMessage(`Here are your ${category}:<br>${itemsList}`, 'bot');
  };

  const handleSendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;

    addMessage(userMessage, 'user');

    const lowerMessage = userMessage.toLowerCase();
    const isAdd = lowerMessage.startsWith("add ");
    const isRemove = lowerMessage.startsWith("remove ");

    if (lowerMessage === "edit wardrobe") {
      setShowWardrobeView(true);
      return;
    }

    if (lowerMessage === "add category") {
      setShowCategoryManager(true);
      return;
    }

    if (isAdd || isRemove) {
      const action = isAdd ? "add" : "remove";
      const itemText = userMessage.slice(action.length).trim();
      
      setTyping(true);
      const category = await askGeminiForCategory(itemText);
      setTyping(false);

      if (!category || !wardrobe[category]) {
        addMessage(`⚠️ I couldn't determine the category for "${itemText}".`, 'bot');
        return;
      }

      if (action === "add") {
        handleAddItem(category, itemText);
      } else {
        handleRemoveItem(itemText, category);
      }
      return;
    }

    if (
      lowerMessage.includes("what should i wear today") ||
      lowerMessage.includes("outfit based on today") ||
      lowerMessage.includes("weather outfit") ||
      lowerMessage.includes("today's weather") ||
      lowerMessage.includes("todays weather") ||
      lowerMessage.includes("today weather") ||
      lowerMessage.includes("suggest based on weather")
    ) {
      setTyping(true);
      try {
        const coords = await getUserLocation();
        const weather = await getWeatherByCoords(coords.latitude, coords.longitude);

        const prompt = `
${weather}

👕 Based on the weather and the following wardrobe:
${JSON.stringify(wardrobe)}

Suggest an outfit in this format:

{emoji} The weather in {city} is {description} with a temperature of {temp}°C.

👕 Outfit suggestion:
Top: ...
Bottom: ...
Shoes: ...
Accessories: ...
`;

        const response = await getGeminiResponse(prompt);
        setTyping(false);
        addMessage(response, 'bot');
      } catch (error) {
        setTyping(false);
        console.error("Weather/Location Error:", error);
        addMessage("⚠️ I couldn't get your location or weather. Please enable location access.", 'bot');
      }
      return;
    }

    setTyping(true);
    try {
      const response = await getGeminiResponse(userMessage);
      setTyping(false);
      addMessage(response, 'bot');
    } catch (error) {
      console.error("Gemini Error:", error);
      setTyping(false);
      addMessage("⚠️ Something went wrong. Try again.", 'bot');
    }
  };

  return (
    <div className="app">
      {showSetup && (
        <div className="wardrobe-setup-modal">
          <div className="wardrobe-setup-content">
            <h2>Set Up Your Wardrobe</h2>
            <p>Let's get started by creating your wardrobe categories and adding some items.</p>
            
            <div className="setup-form">
              <div className="form-group">
                <label>Default Categories:</label>
                <div className="default-categories">
                  {['tops', 'bottoms', 'shoes', 'accessories'].map(category => (
                    <div key={category} className="category-tag">
                      {category}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Add Custom Categories (comma separated):</label>
                <input 
                  type="text" 
                  placeholder="e.g., dresses, outerwear, bags"
                />
              </div>
              
              <div className="setup-buttons">
                <button 
                  className="btn-primary"
                  onClick={() => handleSetupComplete({
                    tops: [],
                    bottoms: [],
                    shoes: [],
                    accessories: []
                  })}
                >
                  Use Default Categories
                </button>
                <button className="btn-secondary">
                  Customize Categories
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showItemEditor && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
            <input
              type="text"
              defaultValue={editingItem || ''}
              placeholder="Enter item name"
            />
            <div className="modal-buttons">
              <button 
                className="btn-primary"
                onClick={() => {
                  const input = document.querySelector('.modal-content input');
                  if (editingItem) {
                    handleEditItem(editingItem, input.value, activeCategory);
                  } else {
                    handleAddItem(activeCategory, input.value);
                  }
                  setShowItemEditor(false);
                }}
              >
                Save
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowItemEditor(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryManager && (
        <div className="modal">
          <div className="modal-content">
            <h3>Manage Categories</h3>
            <div className="category-list">
              {wardrobe && Object.keys(wardrobe).map(category => (
                <div key={category} className="category-item">
                  <span>{category}</span>
                  <button 
                    className="btn-danger"
                    onClick={() => handleRemoveCategory(category)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="add-category">
              <input
                type="text"
                placeholder="New category name"
                id="newCategoryInput"
              />
              <button 
                className="btn-primary"
                onClick={() => {
                  const input = document.getElementById('newCategoryInput');
                  handleAddCategory(input.value);
                  input.value = '';
                }}
              >
                Add Category
              </button>
            </div>
            <div className="modal-buttons">
              <button 
                className="btn-secondary"
                onClick={() => setShowCategoryManager(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showWardrobeView && wardrobe && (
        <div className="modal wardrobe-view-modal">
          <div className="modal-content">
            <h3>Your Wardrobe</h3>
            <div className="wardrobe-container">
              {Object.entries(wardrobe).map(([category, items]) => (
                <div key={category} className="wardrobe-category">
                  <h4>{category}</h4>
                  <ul>
                    {items.map((item, index) => (
                      <li key={index}>
                        <span>{item}</span>
                        <div className="item-actions">
                          <button 
                            className="btn-edit"
                            onClick={() => {
                              setActiveCategory(category);
                              setEditingItem(item);
                              setShowItemEditor(true);
                              setShowWardrobeView(false);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-danger"
                            onClick={() => handleRemoveItem(item, category)}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="btn-add"
                    onClick={() => {
                      setActiveCategory(category);
                      setEditingItem(null);
                      setShowItemEditor(true);
                      setShowWardrobeView(false);
                    }}
                  >
                    + Add Item
                  </button>
                </div>
              ))}
            </div>
            <div className="modal-buttons">
              <button 
                className="btn-secondary"
                onClick={() => setShowWardrobeView(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {wardrobe && (
        <div className="chat-container">
          <div className="chat-header">
            <h1>SmartCloset</h1>
            <div className="header-buttons">
              <button onClick={() => setShowWardrobeView(true)}>View Wardrobe</button>
              <button onClick={() => setShowCategoryManager(true)}>Manage Categories</button>
            </div>
          </div>
          
          <div className="chat-body">
            <div className="messages-container" ref={messagesContainerRef}>
              <div className="welcome-message">
                <h2>Welcome to SmartCloset!</h2>
                <p>Your personal wardrobe assistant. Try asking:</p>
                <ul>
                  <li>"What should I wear today?"</li>
                  <li>"Add black jeans"</li>
                  <li>"Show me my tops"</li>
                </ul>
              </div>
              
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.sender}`}>
                  <div className="message-content">
                    <div dangerouslySetInnerHTML={{ __html: message.text }} />
                  </div>
                  <div className="message-time">{message.time}</div>
                </div>
              ))}
              
              {typing && (
                <div className="message bot">
                  <div className="message-content typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>

            <div className="wardrobe-bar">
              {Object.keys(wardrobe).map(category => (
                <button 
                  key={category}
                  onClick={() => showCategoryItems(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="suggestions">
              <button onClick={() => handleSendMessage("What should I wear today?")}>
                Weather Outfit
              </button>
              <button onClick={() => setShowWardrobeView(true)}>
                View Wardrobe
              </button>
              <button onClick={() => setShowItemEditor(true)}>
                Add New Item
              </button>
            </div>
            
            <div className="input-area">
              <input
                type="text"
                placeholder="Type your message..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('.input-area input');
                  handleSendMessage(input.value);
                  input.value = '';
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      
      <footer>
        <div className="footer-content">© 2025 SmartCloset</div>
      </footer>
    </div>
  );
}

export default App;