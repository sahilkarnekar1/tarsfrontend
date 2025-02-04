import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      alert("Login Successful!");
      navigate("/homepage");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials!");
    }
  };
  const handleNavigateNext = ()=>{
    navigate("/signup")
  }
  return (
    <div className="login-container">
    <h2>Login</h2>
    {error && <p className="error-message">{error}</p>}
    <form onSubmit={handleSubmit} className="login-form">
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Login</button>
    </form>
    <button onClick={handleNavigateNext} className="signup-button">Signup</button>
  </div>
  
  );
};

export default Login;
