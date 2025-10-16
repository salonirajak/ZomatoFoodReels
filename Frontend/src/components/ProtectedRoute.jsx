import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // If still loading, show loading message
  if (loading) {
    return <div className="loading-message">Checking authentication...</div>;
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/user/login" replace />;
  }

  // If authenticated, render the children
  return children;
};

export default ProtectedRoute;