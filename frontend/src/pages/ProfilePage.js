import React from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = ({ username, onSignOut }) => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear any stored tokens or session data
    localStorage.clear();
    onSignOut();
    navigate("/"); // Redirect to the login page
  };

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <p>Welcome, <strong>{username}</strong>!</p>
      <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
    </div>
  );
};

export default ProfilePage;