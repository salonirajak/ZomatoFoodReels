import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth-shared.css";
import axios from "axios";
import API_BASE_URL from '../../config/api';

const FoodPartnerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    email: "",
    password: "",
    address: ""
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
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }
    
    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact name is required";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
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
      const response = await axios.post(
     `${API_BASE_URL}/api/auth/food-partner/register`,
    {
    name: formData.businessName,
    contactName: formData.contactName,
    phone: formData.phone,
    email: formData.email,
    password: formData.password,
    address: formData.address
  },
    { withCredentials: true }
);

  console.log(response.data);

// register ke baad login page par bhejo
  navigate("/food-partner/login");

    } catch (error) {
      console.error("Registration error:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError("Invalid registration data. Please check your inputs.");
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container compact-form">
        <div className="auth-header">
          <h1>Partner Sign Up</h1>
          <p>Grow your business with our platform.</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="auth-form compact-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group compact">
              <label htmlFor="businessName">Business Name *</label>
              <input 
                id="businessName" 
                name="businessName" 
                placeholder="Tasty Bites" 
                autoComplete="organization" 
                value={formData.businessName}
                onChange={handleChange}
                required
                disabled={loading}
                className={errors.businessName ? "error" : ""}
              />
              {errors.businessName && <div className="error-text">{errors.businessName}</div>}
            </div>
            
            <div className="form-group compact">
              <label htmlFor="contactName">Contact Name *</label>
              <input 
                id="contactName" 
                name="contactName" 
                placeholder="Jane Doe" 
                autoComplete="name" 
                value={formData.contactName}
                onChange={handleChange}
                required
                disabled={loading}
                className={errors.contactName ? "error" : ""}
              />
              {errors.contactName && <div className="error-text">{errors.contactName}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group compact">
              <label htmlFor="phone">Phone *</label>
              <input 
                id="phone" 
                name="phone" 
                placeholder="+1 555 123 4567" 
                autoComplete="tel" 
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
                className={errors.phone ? "error" : ""}
              />
              {errors.phone && <div className="error-text">{errors.phone}</div>}
            </div>
            
            <div className="form-group compact">
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
          </div>
          
          <div className="form-group compact">
            <label htmlFor="password">Password *</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Create password" 
              autoComplete="new-password" 
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              disabled={loading}
              className={errors.password ? "error" : ""}
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>
          
          <div className="form-group compact">
            <label htmlFor="address">Address *</label>
            <input 
              id="address" 
              name="address" 
              placeholder="123 Market Street" 
              autoComplete="street-address" 
              value={formData.address}
              onChange={handleChange}
              required
              disabled={loading}
              className={errors.address ? "error" : ""}
            />
            {errors.address && <div className="error-text">{errors.address}</div>}
            <p className="auth-hint">Full address helps customers find you faster.</p>
          </div>
          
          <button 
            className="auth-button compact" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Partner Account'}
          </button>
        </form>
        
        <div className="auth-footer compact">
          <p>Already a partner? <Link to="/food-partner/login">Sign In</Link></p>
          <p>Are you a regular user? <Link to="/user/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerRegister;