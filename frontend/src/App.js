import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [form, setForm] = useState({ username: "", password: "", email: "", name: "", address: "", birthday: "" });
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

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
      const response = await axios.post("http://127.0.0.1:5000/login", form);
      if (response.data.response.AuthenticationResult) {
        localStorage.setItem("accessToken", response.data.response.AuthenticationResult.AccessToken);
        localStorage.setItem("idToken", response.data.response.AuthenticationResult.IdToken);
        localStorage.setItem("refreshToken", response.data.response.AuthenticationResult.RefreshToken);
        window.location.href = "localhost:8000/Project";
      }
    } catch (error) {
      alert(error.response ? error.response.data.error : "An error occurred");
    }
  };

  return (
    <div className="login-container">      
      <h2>Login</h2>
      <input className="input-field" type="text" name="username" placeholder="Username" onChange={handleChange} />
      <input className="input-field" type="password" name="password" placeholder="Password" onChange={handleChange} />
      <button className="login-button" onClick={handleLogin}>Login</button>

      <h2>Sign Up</h2>
      <input className="input-field" type="text" name="username" placeholder="Username" onChange={handleChange} />
      <input className="input-field" type="password" name="password" placeholder="Password" onChange={handleChange} />
      <input className="input-field" type="text" name="name" placeholder="Full Name" onChange={handleChange} />
      <input className="input-field" type="email" name="email" placeholder="Email" onChange={handleChange} />
      <input className="input-field" type="text" name="address" placeholder="Address" onChange={handleChange} />
      <input className="input-field" type="date" id="birthday" name="birthday" placeholder="Birthday" onChange={handleChange} />
      <button className="login-button" onClick={handleSignup}>Sign Up</button>
      
      <h2>Confirm Signup</h2>
      <input className="input-field" type="text" placeholder="Confirmation Code" onChange={(e) => setConfirmationCode(e.target.value)} />
      <button className="login-button" onClick={handleConfirmSignup}>Confirm</button>
    </div>
  );
};

export default App;

