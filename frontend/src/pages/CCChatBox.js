import React, { useState } from "react";
import './CCChatBox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    { sender: "cc", text: "Hi there! I'm CeCe, your AI business companion. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: "user", text: input },
        { sender: "cc", text: "Thanks for your message! Let me process that for you..." }
      ]);
    }, 500);

    setInput("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src="/profile-picture1.png" alt="CC Avatar" className="cc-avatar" />
        <h2>Chat with CeCe</h2>
        <p>Your Cloud Catalyst AI Business Companion</p>
      </div>

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="bubble">{msg.text}</div>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
