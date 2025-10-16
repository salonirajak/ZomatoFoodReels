import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReelFeed from '../components/ReelFeed';
import Header from '../components/Header';
import '../styles/home.css';
import API_BASE_URL from '../config/api';

const Categories = () => {
  const [categories] = useState([
    { id: 1, name: 'Italian', icon: '🍝' },
    { id: 2, name: 'Mexican', icon: '🌮' },
    { id: 3, name: 'Chinese', icon: '🥡' },
    { id: 4, name: 'Indian', icon: '🍛' },
    { id: 5, name: 'Desserts', icon: '🍰' },
    { id: 6, name: 'Healthy', icon: '🥗' },
  ]);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allVideos, setAllVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get(`${API_BASE_URL}/api/food/`, { withCredentials: true });
        setAllVideos(response.data.foodItems);
        setFilteredVideos(response.data.foodItems); // Initially show all videos
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, []);

  useEffect(() => {
    // Filter videos based on selected category
    if (selectedCategory) {
      // In a real app, you would filter by actual category
      // For now, we'll simulate category filtering
      const filtered = allVideos.filter((_, index) => 
        (index % categories.length) + 1 === selectedCategory
      );
      setFilteredVideos(filtered);
    } else {
      // Show all videos when no category is selected
      setFilteredVideos(allVideos);
    }
  }, [selectedCategory, allVideos, categories.length]);

  const handleLike = async (item) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/food/like`, { foodId: item._id }, {withCredentials: true});

      if(response.data.like){
        console.log("Video liked");
        setFilteredVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount + 1 } : v));
        setAllVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount + 1 } : v));
      }else{
        console.log("Video unliked");
        setFilteredVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount - 1 } : v));
        setAllVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount - 1 } : v));
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
        setFilteredVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount + 1 } : v));
        setAllVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount + 1 } : v));
      }else{
        setFilteredVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount - 1 } : v));
        setAllVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount - 1 } : v));
      }
    } catch (err) {
      console.error("Error saving video:", err);
      alert("Failed to save video. Please try again.");
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Header />
      <div className="categories-page">
        <h2>Browse by Category</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <div 
              key={category.id} 
              className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </div>
          ))}
        </div>
        
        <div className="category-videos">
          <h3>{selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All Videos'}</h3>
          {error && (
            <div className="error-message">
              {error}
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button 
                  onClick={() => window.location.reload()} 
                  className="refresh-button"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {loading ? (
            <div className="loading">Loading videos...</div>
          ) : (
            <ReelFeed 
              items={filteredVideos} 
              onLike={handleLike}
              onSave={handleSave}
              emptyMessage="No videos in this category." 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;