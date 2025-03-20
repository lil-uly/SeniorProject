import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import BusinessRegistration from "./pages/BusinessRegistration";

const Auth = () => {
  const [form, setForm] = useState({
    businessName: "",
    businessType: "",
    physicalAddress: "",
    websiteAddress: "",
    email: "",
    firstName: "",
    lastName: "",
  });
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/signup", form);
      alert(response.data.message);
    } catch (error) {
      alert(error.response ? error.response.data.error : "An error occurred");
    }
  };

  const handleConfirmSignup = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/confirm-sign-up", {
        email: form.email,
        code: confirmationCode,
      });
      alert(response.data.message);
      setIsConfirmed(true);
    } catch (error) {
      alert(error.response ? error.response.data.error : "An error occurred");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/login", form);
      if (response.data.response?.AuthenticationResult) {
        localStorage.setItem("accessToken", response.data.response.AuthenticationResult.AccessToken);
        localStorage.setItem("idToken", response.data.response.AuthenticationResult.IdToken);
        localStorage.setItem("refreshToken", response.data.response.AuthenticationResult.RefreshToken);
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        alert("Invalid login response format");
      }
    } catch (error) {
      alert(error.response ? error.response.data.error : `Error: ${error.message}`);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="login-container">
        <h2>Login</h2>
        <input className="input-field" type="email" name="email" placeholder="Email" onChange={handleChange} />
        <input className="input-field" type="password" name="password" placeholder="Password" onChange={handleChange} />
        <button className="login-button" onClick={handleLogin}>Login</button>

        <h2>Sign Up</h2>
        <BusinessRegistration handleChange={handleChange} handleSignup={handleSignup} />

        <h2>Confirm Signup</h2>
        <input className="input-field" type="text" placeholder="Confirmation Code" onChange={(e) => setConfirmationCode(e.target.value)} />
        <button className="login-button" onClick={handleConfirmSignup}>Confirm</button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/business-registration" element={<BusinessRegistration />} />
      </Routes>
    </Router>
  );
};

export default App;
