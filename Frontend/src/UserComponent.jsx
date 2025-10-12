// UserComponent.jsx - Updated with navigation
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Reusable tiny components used by App
export const Avatar = ({ seed }) => {
  // Simple initial-based avatar circle
  return <div className="avatar">{seed}</div>;
};

export const Stars = ({ rating }) => {
  // Render 5 star slots; fill based on rating
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="stars">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half);
        return <span key={i} className={filled ? "star filled" : "star"}>★</span>;
      })}
      <span className="rating-num">{rating.toFixed(1)}</span>
    </div>
  );
};

export const Pill = ({ text }) => <span className="pill">{text}</span>;

export const MentorCard = ({ mentor }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/mentor/${mentor.id}`);
  };

  return (
    <article className="mentor-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="mentor-top">
        <Avatar seed={mentor.avatar} />
        <div className="mentor-name">
          <h3>{mentor.name}</h3>
          <Pill text={mentor.badge} />
        </div>
      </div>
      <div className="mentor-meta">
        <p className="role">{mentor.role}</p>
        <p className="mentees">{mentor.mentees} Mentees</p>
      </div>
      <Stars rating={mentor.rating} />
    </article>
  );
};

export const ChatRow = ({ chat }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Navigate to community chats page with specific chat selected
    const chatId = chat.tag.replace('#', '').replace(/\s+/g, '-');
    navigate(`/community-chats/${chatId}`);
  };

  return (
    <button className="chat-row" onClick={handleClick}>
      <span>{chat.tag}</span>
      <span className="chevron">›</span>
    </button>
  );
};

export const FeedRow = ({ item }) => (
  <div className="feed-row">
    <Avatar seed={item.avatar} />
    <div className="feed-meta">
      <div className="feed-name">{item.name}</div>
      <div className={item.status.toLowerCase().includes("available") ? "status ok" : "status"}>
        {item.status}
      </div>
    </div>
  </div>
);