import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import "../../styles/auth-shared.css";
import API_BASE_URL from '../../config/api';

const FoodPartnerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/food-partner/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Login successful:', data);
        // Redirect to create food page after login
        navigate("/create-food");
      } else {
        // Handle specific error messages from the server
        if (data && data.message) {
          setError(data.message);
        } else {
          setError('Login failed. Please check your credentials and try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Partner Login</h1>
          <p>Access your dashboard and manage orders.</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="business@example.com" 
              autoComplete="email" 
              value={formData.email}
              onChange={handleChange}
              required 
              disabled={loading}
              className={errors.email ? "error" : ""}
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Password" 
              autoComplete="current-password" 
              value={formData.password}
              onChange={handleChange}
              required 
              disabled={loading}
              className={errors.password ? "error" : ""}
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>
          
          <button 
            className="auth-button" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>New partner? <Link to="/food-partner/register">Create an account</Link></p>
          <p>Are you a regular user? <Link to="/user/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerLogin;