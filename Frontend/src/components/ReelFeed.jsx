import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../config/api'

// Reusable feed for vertical reels
// Props:
// - items: Array of video items { _id, video, description, likeCount, savesCount, commentsCount, comments, foodPartner }
// - onLike: (item) => void | Promise<void>
// - onSave: (item) => void | Promise<void>
// - emptyMessage: string
const ReelFeed = ({ items = [], onLike, onSave, emptyMessage = 'No videos yet.' }) => {
  const videoRefs = useRef(new Map())
  const [expandedDescriptions, setExpandedDescriptions] = useState({})
  
  // Log the items being received
  useEffect(() => {
    console.log('ReelFeed received items:', items);
    if (items.length > 0) {
      console.log('First item details:', {
        id: items[0]._id,
        name: items[0].name,
        description: items[0].description,
        descriptionType: typeof items[0].description,
        descriptionLength: items[0].description ? items[0].description.length : 0,
        hasDescription: !!items[0].description
      });
    }
  }, [items]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (!(video instanceof HTMLVideoElement)) return
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().catch(() => { /* ignore autoplay errors */ })
          } else {
            video.pause()
          }
        })
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    )

    videoRefs.current.forEach((vid) => observer.observe(vid))
    return () => observer.disconnect()
  }, [items])

  const setVideoRef = (id) => (el) => {
    if (!el) { videoRefs.current.delete(id); return }
    videoRefs.current.set(id, el)
  }

  // Function to construct full video URL
  const getFullVideoUrl = (videoPath) => {
    // If it's already a full URL, return it as is
    if (videoPath.startsWith('http')) {
      return videoPath;
    }
    // Otherwise, prepend the backend URL
    return `${API_BASE_URL}${videoPath}`;
  };
  
  // Toggle description expansion
  const toggleDescription = (itemId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <div className="reels-page">
      <div className="reels-feed">
        {items.length === 0 && (
          <div className="empty-state" key="empty-state">
            <p>{emptyMessage}</p>
          </div>
        )}

        {items.map((item) => {
          const videoUrl = getFullVideoUrl(item.video);
          const isExpanded = expandedDescriptions[item._id];
          const shouldTruncate = item.description && item.description.length > 150;
          // Fixed the description display logic
          const displayDescription = item.description && item.description.trim() !== "" 
            ? (isExpanded || !shouldTruncate ? item.description : `${item.description.substring(0, 150)}...`)
            : "No description available";
          
          return (
            <section key={item._id} className="reel">
              {/* Video container */}
              <div className="reel-video-container">
                <video
                  key={`video-${item._id}`}
                  ref={setVideoRef(item._id)}
                  className="reel-video"
                  src={videoUrl}
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  controls={false}
                  disablePictureInPicture
                  controlsList="nodownload nofullscreen noremoteplayback"
                />
                
                {/* Overlay content */}
                <div className="reel-overlay">
                  <div className="reel-overlay-gradient"></div>
                  <div className="reel-content">
                    {/* Button first, then description */}
                    {item.foodpartner && (
                      <Link 
                        key={`link-${item._id}`} 
                        className="reel-btn" 
                        to={`/profile/food-partner/${item.foodpartner._id}`}
                      >
                        Visit store
                      </Link>
                    )}
                    <p 
                      key={`desc-${item._id}`} 
                      className="reel-description"
                    >
                      {displayDescription}
                      {shouldTruncate && (
                        <button 
                          onClick={() => toggleDescription(item._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff6b35',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            marginLeft: '5px',
                            padding: '0'
                          }}
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="reel-actions">
                <div className="reel-action-group" key={`like-group-${item._id}`}>
                  <button
                    key={`like-btn-${item._id}`}
                    onClick={onLike ? () => onLike(item) : undefined}
                    className="reel-action"
                    aria-label="Like"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                  <div 
                    key={`like-count-${item._id}`} 
                    className="reel-action__count"
                  >
                    {item.likeCount ?? 0}
                  </div>
                </div>

                <div className="reel-action-group" key={`save-group-${item._id}`}>
                  <button
                    key={`save-btn-${item._id}`}
                    className="reel-action"
                    onClick={onSave ? () => onSave(item) : undefined}
                    aria-label="Save"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                  <div 
                    key={`save-count-${item._id}`} 
                    className="reel-action__count"
                  >
                    {item.savesCount ?? 0}
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default ReelFeed