import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api";

const Signup = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, formData);
      alert("Signup Successful! Please login.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed!");
    }
  };
const handleNavigateNext = ()=>{
  navigate("/")
}
  return (
    <div className="login-container">
    <h2>Signup</h2>
    {error && <p className="error-message">{error}</p>}
    <form onSubmit={handleSubmit} className="login-form">
      <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Signup</button>
    </form>
    <button onClick={handleNavigateNext} className="signup-button">Login</button>
  </div>
  
  );
};

export default Signup;
