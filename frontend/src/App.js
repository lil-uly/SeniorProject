import React, { useState } from "react";
import axios from "axios";

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
      if (response && response.data) {
        alert(response.data.message);
      } else {
        alert("Unexpected response structure");
      }
    } catch (error) {
      console.error("Error during signup:", error);
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
      const response = await axios.post("http://127.0.0.1:5000/login", form, { 
        // Include `withCredentials: true` if needed for cookies or sessions
      });
      
      // If the response status is a redirect, you should handle it
      if (response.status === 200 && response.data.redirect) {
        window.location.href = response.data.redirect;  // Redirect the user to the URL from the response
      } else {
        alert("Unexpected response structure");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert(error.response ? error.response.data.error : "An error occurred");
    }
  };

  return (
    <div>
      <h1>Signup</h1>
      <input type="text" name="username" placeholder="Username" onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} />
      <input type="text" name="name" placeholder="Full Name" onChange={handleChange} />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} />
      <input type="text" name="address" placeholder="Address" onChange={handleChange} />
      <input type="date" name="birthday" placeholder="Birthday" onChange={handleChange} />
      <button onClick={handleSignup}>Sign Up</button>
      
      <h2>Confirm Signup</h2>
      <input type="text" placeholder="Confirmation Code" onChange={(e) => setConfirmationCode(e.target.value)} />
      <button onClick={handleConfirmSignup}>Confirm</button>

      <h1>Login</h1>
      <input 
        type="text" 
        name="username" 
        placeholder="Username" 
      />
      <input 
        type="password" 
        name="password" 
        placeholder="Password" 
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default App;