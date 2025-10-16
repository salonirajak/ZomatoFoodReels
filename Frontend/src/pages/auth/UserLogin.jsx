import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../../styles/auth-shared.css';
import API_BASE_URL from '../../config/api';

const UserLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(data);
        // Redirect to home page after successful login
        navigate("/home");
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue your food journey.</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="you@example.com" 
              autoComplete="email" 
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              autoComplete="current-password" 
              required
              disabled={loading}
            />
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
          <p>New here? <Link to="/user/register">Create account</Link></p>
          <p>Are you a food partner? <Link to="/food-partner/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;