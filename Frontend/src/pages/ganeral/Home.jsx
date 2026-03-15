import React, { useEffect, useState } from 'react'
import axios from 'axios';
import '../../styles/reels.css'
import '../../styles/home.css'
import ReelFeed from '../../components/ReelFeed'
import Header from '../../components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import API_BASE_URL from '../../config/api';

// Configure axios to always send credentials
axios.defaults.withCredentials = true;

const Home = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [ videos, setVideos ] = useState([])
    const [ error, setError ] = useState(null)
    const [ loading, setLoading ] = useState(true)
    const location = useLocation();
    
    const fetchVideos = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching videos from:', `${API_BASE_URL}/api/food/`);
            const response = await axios.get(`${API_BASE_URL}/api/food/`, { withCredentials: true })
            console.log('Food items received:', response.data);
            console.log('Food items array length:', response.data.foodItems ? response.data.foodItems.length : 0);
            
            // Log details of each food item to see what data we're getting
            if (response.data.foodItems) {
                console.log('Detailed food items data:');
                response.data.foodItems.forEach((item, index) => {
                    console.log(`Item ${index}:`, {
                        id: item._id,
                        name: item.name,
                        description: item.description,
                        descriptionType: typeof item.description,
                        descriptionLength: item.description ? item.description.length : 0,
                        hasDescription: !!item.description,
                        video: item.video,
                        foodpartner: item.foodpartner
                    });
                });
            }
            
            setVideos(response.data.foodItems || [])
        } catch (err) {
            console.error("Error fetching food items:", err);
            setError("Failed to load videos. Please try again later.")
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [location.key]) // Add location.key as dependency to refresh when navigation occurs

    const handleLogout = async () => {
        await logout();
        navigate('/user/login');
    };

    // Using local refs within ReelFeed; keeping map here for dependency parity if needed

    async function likeVideo(item) {
        try {
            console.log('Attempting to like video with ID:', item._id);
            
            // Log the request details before sending
            const requestConfig = {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            console.log('Request URL:', `${API_BASE_URL}/api/food/like`);
            console.log('Request Data:', { foodId: item._id });
            console.log('Request Config:', requestConfig);
            
            // Updated to use proper error handling and CORS configuration
            const response = await axios.post(
                `${API_BASE_URL}/api/food/like`, 
                { foodId: item._id }, 
                requestConfig
            )

            console.log('Like response:', response.data);
            
            // Check if it's a like or unlike based on the response message
            if(response.data.message && response.data.message.includes('liked')){
                console.log("Video liked");
                setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount + 1 } : v))
            } else if(response.data.message && response.data.message.includes('unliked')){
                console.log("Video unliked");
                setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount - 1 } : v))
            }
        } catch (err) {
            console.error("Error liking video:", err);
            console.error("Error details:", {
                message: err.message,
                code: err.code,
                response: err.response?.data,
                status: err.response?.status,
                request: {
                    url: err.config?.url,
                    method: err.config?.method,
                    data: err.config?.data,
                    headers: err.config?.headers
                }
            });
            
            // Show a more detailed error message to the user
            let errorMessage = "Failed to like video. Please try again.";
            if (err.response?.status === 400) {
                errorMessage = "Bad request: " + (err.response.data?.message || "Invalid request data");
            } else if (err.response?.status === 401) {
                errorMessage = "Authentication required. Please log in again.";
            } else if (err.response?.status === 500) {
                errorMessage = "Server error. Please try again later.";
            }
            
            alert(errorMessage);
        }
    }

    async function saveVideo(item) {
        try {
            console.log('Attempting to save video with ID:', item._id);
            
            // Log the request details before sending
            const requestConfig = {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            console.log('Request URL:', `${API_BASE_URL}/api/food/save`);
            console.log('Request Data:', { foodId: item._id });
            console.log('Request Config:', requestConfig);
            
            const response = await axios.post(
                `${API_BASE_URL}/api/food/save`, 
                { foodId: item._id }, 
                requestConfig
            )
            
            console.log('Save response:', response.data);
            
            // Check if it's a save or unsave based on the response message
            if(response.data.message && response.data.message.includes('saved')){
                console.log("Video saved");
                setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount + 1 } : v))
            } else if(response.data.message && response.data.message.includes('unsaved')){
                console.log("Video unsaved");
                setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount - 1 } : v))
            }
        } catch (err) {
            console.error("Error saving video:", err);
            console.error("Error details:", {
                message: err.message,
                code: err.code,
                response: err.response?.data,
                status: err.response?.status,
                request: {
                    url: err.config?.url,
                    method: err.config?.method,
                    data: err.config?.data,
                    headers: err.config?.headers
                }
            });
            
            // Show a more detailed error message to the user
            let errorMessage = "Failed to save video. Please try again.";
            if (err.response?.status === 400) {
                errorMessage = "Bad request: " + (err.response.data?.message || "Invalid request data");
            } else if (err.response?.status === 401) {
                errorMessage = "Authentication required. Please log in again.";
            } else if (err.response?.status === 500) {
                errorMessage = "Server error. Please try again later.";
            }
            
            alert(errorMessage);
        }
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Header onLogout={handleLogout} />
            {error && <div className="error-message">{error}</div>}

     {loading ? (
         <div className="loading-message">Loading videos...</div>
     ) : (
      <ReelFeed
      items={videos}
      onLike={likeVideo}
      onSave={saveVideo}
      emptyMessage="No videos available."
    />
    )}

    <div className="refresh-button-container">
        
     <button onClick={fetchVideos} className="refresh-button">Refresh Videos</button>

      </div>
           
        </div>
    )
}

export default Home