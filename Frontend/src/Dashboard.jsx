// Dashboard.jsx
import React from "react";
import "./App.css";

const Dashboard = () => {
  const mentors = [
    {
      initials: "HK",
      name: "Harshleen Kaur",
      role: "Can do anything",
      mentees: 12,
      rating: 4.8,
    },
    {
      initials: "DK",
      name: "DishavPreet Kaur",
      role: "Backend developer",
      mentees: 7,
      rating: 4.5,
    },
    {
      initials: "PA",
      name: "Manraj Singh Khehra",
      role: "Frontend developer",
      mentees: 9,
      rating: 4.7,
    },
    {
      initials: "AS",
      name: "Padampreet Singh",
      role: "ML / Web Dev",
      mentees: 10,
      rating: 4.6,
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Recommended Mentors */}
      <div className="card-section">
        <h2>Recommended Mentors</h2>
        <div className="mentor-list">
          {mentors.map((m, index) => (
            <div key={index} className="mentor-card">
              <h4>{m.initials}</h4>
              <h3>{m.name}</h3>
              <p>Recommended For You</p>
              <p>{m.role}</p>
              <p>{m.mentees} Mentees</p>
              <p>⭐ {m.rating}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-section">
        {/* Community Chats */}
        <div className="community-chats">
          <h2>Community Chats</h2>
          <div className="chat-tags">
            <span>#machine-learning</span>
            <span>#web-development</span>
            <span>#competitive-programming</span>
          </div>
        </div>

        {/* Mentor Feed */}
        <div className="mentor-feed">
          <h2>Mentor Feed</h2>
          {mentors.map((m, index) => (
            <p key={index}>
              <strong>{m.initials}</strong> {m.name} - Available
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
