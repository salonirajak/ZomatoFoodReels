import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../../styles/profile.css';
import Header from '../../components/Header';
import API_BASE_URL from '../../config/api';

const Profile = () => {
    const { id } = useParams();
    const [foodPartner, setFoodPartner] = useState(null);
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFoodPartner = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/food`);
                const allFoodItems = response.data.foodItems;
                const partnerItems = allFoodItems.filter(item => 
                    item.foodpartner && item.foodpartner._id === id
                );
                
                setFoodItems(partnerItems);
                
                // Simulate food partner data
                setFoodPartner({
                    name: "Food Partner",
                    description: "Delicious food from our partner restaurants",
                    followers: 12500,
                    rating: 4.8
                });
            } catch (error) {
                console.error('Error fetching food partner:', error);
                setError('Failed to load profile data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchFoodPartner();
    }, [id]);

    if (loading) {
        return (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Header />
                <div className="profile-page">
                    <div className="loading">Loading profile...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <Header />
                <div className="profile-page">
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Header />
            <div className="profile-page">
                {foodPartner && (
                    <div className="profile-header">
                        <div className="profile-info">
                            <h1>{foodPartner.name}</h1>
                            <p>{foodPartner.description}</p>
                            <div className="profile-stats">
                                <span>Followers: {foodPartner.followers.toLocaleString()}</span>
                                <span>Rating: {foodPartner.rating} ⭐</span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="profile-content">
                    <h2>Food Videos</h2>
                    {foodItems.length > 0 ? (
                        <div className="food-items-grid">
                            {foodItems.map(item => (
                                <div key={item._id} className="food-item-card">
                                    <video 
                                        src={`${API_BASE_URL}${item.video}`}
                                        className="food-item-video"
                                        muted
                                        playsInline
                                        loop
                                    />
                                    <div className="food-item-info">
                                        <h3>{item.name}</h3>
                                        <p>{item.description}</p>
                                        <div className="food-item-stats">
                                            <span>❤️ {item.likeCount}</span>
                                            <span>🔖 {item.savesCount}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No food videos uploaded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;