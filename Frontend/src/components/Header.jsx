import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onLogout }) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>FoodReels</h1>
        </Link>
        <nav className="header-nav">
          <Link to="/search" className="nav-link">Search</Link>
          <Link to="/categories" className="nav-link">Categories</Link>
          <Link to="/saved" className="nav-link">Saved</Link>
          {onLogout && (
            <button onClick={handleLogout} className="nav-link logout-button">Logout</button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;