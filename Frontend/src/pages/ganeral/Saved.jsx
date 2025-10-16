import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReelFeed from '../../components/ReelFeed';
import Header from '../../components/Header';
import '../../styles/saved.css';
import '../../styles/home.css';
import API_BASE_URL from '../../config/api';

// Configure axios to always send credentials
axios.defaults.withCredentials = true;

const Saved = () => {
    const [savedVideos, setSavedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSavedVideos = async () => {
            try {
                setLoading(true);
                setError('');
                
                const response = await axios.get(`${API_BASE_URL}/api/food/`, { withCredentials: true });
                
                // Simulate saved videos by marking every other video as saved
                const saved = response.data.foodItems.filter((_, index) => index % 2 === 0);
                setSavedVideos(saved);
            } catch (error) {
                console.error('Error fetching saved videos:', error);
                setError('Failed to load saved videos. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSavedVideos();
    }, []);

    const handleLike = async (item) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/food/like`, { foodId: item._id }, {withCredentials: true});

            if(response.data.like){
                console.log("Video liked");
                setSavedVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount + 1 } : v));
            }else{
                console.log("Video unliked");
                setSavedVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount - 1 } : v));
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
                // If saving again, increment count
                setSavedVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount + 1 } : v));
            }else{
                // If unsaving, remove from list
                setSavedVideos((prev) => prev.filter(video => video._id !== item._id));
            }
        } catch (err) {
            console.error("Error saving video:", err);
            alert("Failed to save video. Please try again.");
        }
    };

    if (loading) {
        return (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Header />
                <div className="saved-page">
                    <div className="loading">Loading saved videos...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Header />
                <div className="saved-page">
                    <div className="error-message">{error}</div>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="refresh-button"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Header />
            <div className="saved-page">
                <h2>Saved Videos</h2>
                {savedVideos.length > 0 ? (
                    <ReelFeed
                        items={savedVideos}
                        onLike={handleLike}
                        onSave={handleSave}
                        emptyMessage="No saved videos yet."
                    />
                ) : (
                    <div className="empty-state">
                        <p>You haven't saved any videos yet.</p>
                        <p>Start exploring and save your favorite food videos!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Saved;