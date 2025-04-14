import React, { useState } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [prompt, setPrompt] = useState(""); // User input
  const [responses, setResponses] = useState([]); // Chat history

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      alert("Please enter a prompt!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/bedrock-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.response) {
        setResponses((prev) => [...prev, { user: prompt, bot: data.response }]);
      } else {
        setResponses((prev) => [...prev, { user: prompt, bot: "Error: No response from the agent." }]);
      }
    } catch (error) {
      console.error("Error communicating with the Bedrock agent:", error);
      setResponses((prev) => [...prev, { user: prompt, bot: "Error: Unable to connect to the server." }]);
    }

    setPrompt(""); // Clear the input field
  };

  return (
    <div className="chatbot-container">
      <h1>Chatbot</h1>
      <div className="chat-history">
        {responses.map((response, index) => (
          <div key={index} className="chat-message">
            <strong>User:</strong> {response.user}
            <br />
            <strong>Bot:</strong> {response.bot}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;