import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth-shared.css';

const ChooseRegister = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Join FoodReels</h1>
          <p>Choose your account type</p>
        </div>
        
        <div className="auth-options">
          <Link to="/user/register" className="auth-option-card">
            <div className="auth-option-icon">👤</div>
            <h3>Regular User</h3>
            <p>Browse, like, and save food videos</p>
          </Link>
          
          <Link to="/food-partner/register" className="auth-option-card">
            <div className="auth-option-icon">🏪</div>
            <h3>Food Partner</h3>
            <p>Share your food videos with the world</p>
          </Link>
        </div>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/user/login">Sign In as User</Link> or <Link to="/food-partner/login">Sign In as Partner</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ChooseRegister;