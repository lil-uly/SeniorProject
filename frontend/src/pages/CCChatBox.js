import React, { useState, useEffect, useRef } from "react";
import './CCChatBox.css';


const CCChatBox = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId') || '');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('sessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, [sessionId]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setIsLoading(true);
    const userMessage = chatInput;
    setChatInput('');
    
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage,
          sessionId: localStorage.getItem('sessionId')
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          throw new Error('Please log in to continue chatting');
        }
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || 'Sorry, no response received' 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'error',
        content: error.message || 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleResetChat = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/reset-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset chat');
      }
      
      setChatMessages([]);
      
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('sessionId', newSessionId);
      setSessionId(newSessionId);
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
  };

  return (
    <div className="chat-section">
      <div className="chat-container" ref={chatContainerRef}>
        {chatMessages.map((message, index) => (
          <div key={index} className={`chat-message ${message.role}`}>
            <strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong>
            <p>{message.content}</p>
          </div>
        ))}
        {isLoading && <div className="loading-indicator">Loading...</div>}
      </div>
      
      <form onSubmit={handleChatSubmit} className="chat-input-form">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
        <button type="button" onClick={handleResetChat} disabled={isLoading}>
          Reset Chat
        </button>
      </form>
    </div>
  );
};

export default CCChatBox;
