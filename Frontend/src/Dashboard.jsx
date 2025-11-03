import React, { useEffect, useState } from "react";
import "./App.css";
import { mentors, chats, feed } from "./User.jsx";
import { MentorCard, ChatRow, FeedRow } from "./UserComponent.jsx";
import axios from "axios";

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/user/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserRole(res.data.role);
      } catch (err) {
        console.error("Error fetching user role:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading dashboard...</p>;

  return (
    <>
      {userRole === "mentor" ? <MentorDashboard /> : <MenteeDashboard />}
    </>
  );
};

export default Dashboard;

// -------------------- MENTEE DASHBOARD --------------------
function MenteeDashboard() {
  return (
    <main className="container">
      <div
        className="welcome-banner"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "24px",
          borderRadius: "16px",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: "0 0 8px 0", fontSize: "24px" }}>
          Welcome to the Mentorship Community! 🚀
        </h2>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Connect with mentors, join discussions, and accelerate your learning journey
        </p>
      </div>

      <section className="panel">
        <h2 className="panel-title">Recommended Mentors</h2>
        <div className="mentor-grid">
          {mentors.map((m) => (
            <MentorCard key={m.id} mentor={m} />
          ))}
        </div>
      </section>

      <section className="two-col">
        <div className="panel">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h2 className="panel-title">Community Chats</h2>
            <span
              style={{
                fontSize: "12px",
                color: "#10b981",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                }}
              />
              24 online
            </span>
          </div>
          <div className="chat-list">
            {chats.map((c) => (
              <ChatRow key={c.id} chat={c} />
            ))}
          </div>
          <button
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "12px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              background: "white",
              color: "#64748b",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
            onClick={() => (window.location.href = "/community-chats")}
          >
            View All Chats →
          </button>
        </div>

        <div className="panel">
          <h2 className="panel-title">Mentor Feed</h2>
          <div className="feed-list">
            {feed.map((f) => (
              <FeedRow key={f.id} item={f} />
            ))}
          </div>
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "#f8fafc",
              borderRadius: "8px",
              textAlign: "center",
              fontSize: "14px",
              color: "#64748b",
            }}
          >
            💡 <strong>Tip:</strong> Join community chats to connect with mentors!
          </div>
        </div>
      </section>
    </main>
  );
}

// -------------------- MENTOR DASHBOARD --------------------
function MentorDashboard() {
  return (
    <main className="container">
      <div
        className="welcome-banner"
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          padding: "24px",
          borderRadius: "16px",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: "0 0 8px 0", fontSize: "24px" }}>
          Welcome, Mentor! 🌱
        </h2>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Manage mentee requests, view active mentees, and share updates with the community.
        </p>
      </div>

      <section className="panel">
        <h2 className="panel-title">Incoming Mentee Requests</h2>
        <p>📩 This section will show incoming requests fetched from backend (next step).</p>
      </section>

      <section className="panel">
        <h2 className="panel-title">Your Mentees</h2>
        <p>👥 This will show accepted mentees (connections) fetched from backend.</p>
      </section>
    </main>
  );
}
