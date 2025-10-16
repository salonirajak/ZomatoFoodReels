import React, { useState } from 'react';
import axios from 'axios';
import ReelFeed from '../components/ReelFeed';
import Header from '../components/Header';
import API_BASE_URL from '../config/api';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    setLoading(true);
    setError('');
    setHasSearched(true);
    
    try {
      // In a real app, you would have a search endpoint
      // For now, we'll filter the existing food items
      const response = await axios.get(`${API_BASE_URL}/api/food/`, { withCredentials: true });
      const filtered = response.data.foodItems.filter(item => 
        (item.name && item.name.toLowerCase().includes(query.toLowerCase())) || 
        (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (item) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/food/like`, { foodId: item._id }, {withCredentials: true});

      if(response.data.like){
        console.log("Video liked");
        setResults((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount + 1 } : v));
      }else{
        console.log("Video unliked");
        setResults((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount - 1 } : v));
      }
    } catch (err) {
      console.error("Error liking video:", err);
      alert("Failed to like video. Please try again.");
    }
  };

  const handleSave = async (item) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/food/save`, { foodId: item._id }, { withCredentials: true });
      
      if(response.data.save){
        setResults((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount + 1 } : v));
      }else{
        setResults((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount - 1 } : v));
      }
    } catch (err) {
      console.error("Error saving video:", err);
      alert("Failed to save video. Please try again.");
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Header />
      <div className="search-page">
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (error && e.target.value.trim()) {
                  setError('');
                }
              }}
              placeholder="Search for food videos..."
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading">Searching...</div>
          ) : hasSearched ? (
            <ReelFeed 
              items={results} 
              onLike={handleLike}
              onSave={handleSave}
              emptyMessage="No results found. Try a different search term." 
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              <p>Enter a search term to find food videos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;