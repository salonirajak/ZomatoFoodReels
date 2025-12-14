import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import '../../styles/create-food.css';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import API_BASE_URL from '../../config/api';

const CreateFood = () => {
    const [ name, setName ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ videoFile, setVideoFile ] = useState(null);
    const [ videoURL, setVideoURL ] = useState('');
    const [ fileError, setFileError ] = useState('');
    const [ uploading, setUploading ] = useState(false);
    const [ uploadProgress, setUploadProgress ] = useState(0);
    const [ error, setError ] = useState('');
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!videoFile) {
            setVideoURL('');
            return;
        }
        const url = URL.createObjectURL(videoFile);
        setVideoURL(url);
        return () => URL.revokeObjectURL(url);
    }, [ videoFile ]);

    const onFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) { 
            setVideoFile(null); 
            setFileError(''); 
            return; 
        }
        
        // Validate file
        if (!validateFile(file)) {
            return;
        }
        
        setFileError('');
        setVideoFile(file);
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer?.files?.[0];
        if (!file) { 
            setFileError(''); 
            return; 
        }
        
        // Validate file
        if (!validateFile(file)) {
            return;
        }
        
        setFileError('');
        setVideoFile(file);
    };
    
    const validateFile = (file) => {
        // Check if it's a video file
        if (!file.type.startsWith('video/')) {
            setFileError('Please select a valid video file (MP4, WebM, MOV).');
            return false;
        }
        
        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            setFileError('File size must be less than 50MB.');
            return false;
        }
        
        return true;
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const openFileDialog = () => fileInputRef.current?.click();

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validation
        if (!name.trim()) {
            setError('Food name is required');
            return;
        }
        
        if (!videoFile) {
            setError('Please select a video file');
            return;
        }
        
        // Check file type
        if (!videoFile.type.startsWith('video/')) {
            setError('Please select a valid video file');
            return;
        }
        
        // Check file size (50MB limit)
        if (videoFile.size > 50 * 1024 * 1024) {
            setError('File size must be less than 50MB');
            return;
        }

        // Prepare form data with trimmed values
        const trimmedName = name.trim();
        const trimmedDescription = description.trim();

        const formData = new FormData();
        formData.append('name', trimmedName);
        formData.append('description', trimmedDescription);
        formData.append('video', videoFile);

        setUploading(true);
        setUploadProgress(0);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/food`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                }
            });

            console.log('Upload successful:', response.data);
            alert('Food video uploaded successfully!');
            // Reset form
            setName('');
            setDescription('');
            setVideoFile(null);
            setVideoURL('');
            navigate("/"); // Redirect to home after successful creation
        } catch (error) {
            console.error('Upload error:', error);
            if (error.response) {
                // Server responded with error
                setError(error.response.data.message || 'Error uploading food video. Please try again.');
            } else if (error.request) {
                // Request was made but no response
                setError('Network error. Please check your connection and try again.');
            } else {
                // Something else happened
                setError('Error uploading food video. Please try again.');
            }
        } finally {
            setUploading(false);
        }
    };

    const isDisabled = useMemo(() => !name.trim() || !videoFile || uploading, [ name, videoFile, uploading ]);

    // Add a loading indicator function
    const getSubmitButtonText = () => {
        if (uploading) {
            return `Uploading... ${uploadProgress}%`;
        }
        return 'Share Video';
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Header />
            <div className="create-food-page">
                <div className="create-food-card">
                    <header className="create-food-header">
                        <h1 className="create-food-title">Create Food Video</h1>
                        <p className="create-food-subtitle">Share your delicious food with the world</p>
                    </header>

                    {error && <div className="error-message" style={{color: '#ff4757', backgroundColor: 'rgba(255, 71, 87, 0.1)', padding: '10px', borderRadius: '5px', marginBottom: '15px'}}>{error}</div>}

                    <form className="create-food-form" onSubmit={onSubmit}>
                        <div className="form-group">
                            <label htmlFor="foodVideo">Food Video *</label>
                            <input
                                id="foodVideo"
                                ref={fileInputRef}
                                className="file-input-hidden"
                                type="file"
                                accept="video/*"
                                onChange={onFileChange}
                                disabled={uploading}
                            />

                            <div
                                className="file-dropzone"
                                role="button"
                                tabIndex={0}
                                onClick={openFileDialog}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFileDialog(); } }}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                style={{ borderColor: fileError ? '#ff4757' : undefined, padding: '1rem' }} /* Reduced padding */
                            >
                                <div className="file-dropzone-inner">
                                    <svg className="file-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"> {/* Reduced size */}
                                        <path d="M10.8 3.2a1 1 0 0 1 .4-.08h1.6a1 1 0 0 1 1 1v1.6h1.6a1 1 0 0 1 1 1v1.6h1.6a1 1 0 0 1 1 1v7.2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6.4a1 1 0 0 1 1-1h1.6V3.2a1 1 0 0 1 1-1h1.6a1 1 0 0 1 .6.2z" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M9 12.75v-1.5c0-.62.67-1 1.2-.68l4.24 2.45c.53.3.53 1.05 0 1.35L10.2 16.82c-.53.31-1.2-.06-1.2-.68v-1.5" fill="currentColor" />
                                    </svg>
                                    <div className="file-dropzone-text" style={{fontSize: '0.9rem'}}> {/* Smaller font */}
                                        <strong>Tap to upload</strong> or drag and drop
                                    </div>
                                    <div className="file-hint" style={{fontSize: '0.8rem'}}> {/* Smaller font */}
                                        MP4, WebM, MOV • Up to 50MB
                                    </div>
                                </div>
                            </div>

                            {fileError && <p className="error-text" role="alert" style={{color: '#ff4757', marginTop: '0.5rem'}}>{fileError}</p>}

                            {videoFile && (
                                <div className="file-chip" aria-live="polite">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                        <path d="M9 12.75v-1.5c0-.62.67-1 1.2-.68l4.24 2.45c.53.3.53 1.05 0 1.35L10.2 16.82c-.53.31-1.2-.06-1.2-.68v-1.5" />
                                    </svg>
                                    <span className="file-chip-name">{videoFile.name}</span>
                                    <span className="file-chip-size">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</span>
                                    <div className="file-chip-actions">
                                        <button type="button" className="btn-ghost" onClick={openFileDialog} disabled={uploading}>Change</button>
                                        <button type="button" className="btn-ghost danger" onClick={() => { setVideoFile(null); setFileError(''); }} disabled={uploading}>Remove</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {videoURL && (
                            <div className="video-preview">
                                <h3 style={{fontSize: '1rem', marginBottom: '0.5rem'}}>Video Preview</h3> {/* Smaller heading */}
                                <video className="video-preview-el" src={videoURL} controls playsInline preload="metadata" style={{width: '100%', maxHeight: '250px'}} /> {/* Reduced max height */}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="foodName">Name *</label>
                            <input
                                id="foodName"
                                type="text"
                                placeholder="e.g., Spicy Paneer Wrap"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={uploading}
                                maxLength={100}
                                style={{fontSize: '0.9rem'}} /* Slightly smaller font */
                            />
                            <div style={{fontSize: '0.7rem', color: '#fff', marginTop: '0.25rem', textAlign: 'right'}}>
                                {name.length}/100 characters
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="foodDesc">Description</label>
                            <textarea
                                id="foodDesc"
                                rows={3} /* Reduced from 4 */
                                placeholder="Write a short description: ingredients, taste, spice level, etc."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={uploading}
                                maxLength={500}
                                style={{fontSize: '0.9rem'}} /* Slightly smaller font */
                            />
                            <div style={{fontSize: '0.7rem', color: description.length > 450 ? '#ff6b35' : '#fff', marginTop: '0.25rem', textAlign: 'right'}}>
                                {description.length}/500 characters
                            </div>
                        </div>

                        {uploading && (
                            <div className="upload-progress">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <p>Uploading... {uploadProgress}%</p>
                            </div>
                        )}

                        <div className="form-actions">
                            <button className="btn-primary" type="submit" disabled={isDisabled}>
                                {getSubmitButtonText()}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateFood;