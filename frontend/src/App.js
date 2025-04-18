import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import DashboardPage from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import CCChatBox from "./pages/CCChatBox";
import Settings from "./pages/Settings";
import Auth from "./components/Auth";

// AppContent component with chat integration
const AppContent = () => {
  const location = useLocation();
  const hideAssistant = ['/login', '/register', '/signup', '/'].includes(location.pathname);
  const [username, setUsername] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSignOut = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route 
          path="/ccchatbox" 
          element={
            <CCChatBox 
              isAuthenticated={isAuthenticated} 
              username={username} 
            />
          } 
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/profile"
          element={<ProfilePage username={username} onSignOut={handleSignOut} />}
        />
      </Routes>

      {/* Floating chat assistant */}
      {!hideAssistant && isAuthenticated && (
        <div className="floating-chat">
          <CCChatBox 
            isAuthenticated={isAuthenticated}
            username={username}
          />
        </div>
      )}
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;