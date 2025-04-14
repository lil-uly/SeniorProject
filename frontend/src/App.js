import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import DashboardPage from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot"; // Import the Chatbot component

const Auth = () => {
  const [form, setForm] = useState({
          businessName: '',
          businessType: '',
          address: '',
          website: '',
          email: '',
          firstName: '',
          lastName: '',
          username: '',
          password: '',
          phoneNumbers: '',
          birthdate: ''
      });
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate(); // Now inside a Router-wrapped component

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
        username: form.username,
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
      console.log("Form Data: ", form); // Log the form data for debugging
      const response = await axios.post("http://127.0.0.1:5000/login", form);
      console.log("API Response:", response.data);
  
      if (response.data.response && response.data.response.AuthenticationResult) {
        localStorage.setItem("accessToken", response.data.response.AuthenticationResult.AccessToken);
        localStorage.setItem("idToken", response.data.response.AuthenticationResult.IdToken);
        localStorage.setItem("refreshToken", response.data.response.AuthenticationResult.RefreshToken);
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        alert("Invalid login response format");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.response ? error.response.data.error : `Error: ${error.message}`);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <input className="input-field" type="text" name="username" placeholder="Username" onChange={handleChange} />
      <input className="input-field" type="password" name="password" placeholder="Password" onChange={handleChange} />
      <button className="login-button" onClick={handleLogin}>Login</button>

      <h2>Personal Information</h2>
      <input className="input-field" type="text" name="firstName" placeholder="First Name" onChange={handleChange} />
      <input className="input-field" type="text" name="lastName" placeholder="Last Name" onChange={handleChange} />
      <input className="input-field" type="text" name="username" placeholder="Username" onChange={handleChange} />
      <input className="input-field" type="password" name="password" placeholder="Password" onChange={handleChange} />
      <input className="input-field" type="date" name="birthdate" placeholder="Birthdate" onChange={handleChange} />

      <h2>Business Registration</h2>
      <input className="input-field" type="text" name="businessName" placeholder="Business Name" onChange={handleChange} />
      <select
        name="businessType"
        value={form.businessType}
        onChange={handleChange}
        required
        placeholder="Business Type">
        <option value="">Business Type</option>
        <option value="retail">Retail</option>
        <option value="service">Service</option>
        <option value="manufacturing">Manufacturing</option>
        <option value="other">Other</option>
      </select>
      <input className="input-field" type="text" name="address" placeholder="Physical Address" onChange={handleChange} />
      <input className="input-field" type="text" name="website" placeholder="Website" onChange={handleChange} />
      <input className="input-field" type="email" name="email" placeholder="Email" onChange={handleChange} />
      <input className="input-field" type="text" name="phoneNumbers" placeholder="Phone Number" onChange={handleChange} />
      <button className="login-button" onClick={handleSignup}>Register</button>

      <h2>Confirm Registration</h2>
      <input className="input-field" type="text" placeholder="Confirmation Code" onChange={(e) => setConfirmationCode(e.target.value)} />
      <button className="login-button" onClick={handleConfirmSignup}>Confirm</button>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chatbot" element={<Chatbot />} /> {/* Add Chatbot route */}
      </Routes>
    </Router>
  );
};

export default App;