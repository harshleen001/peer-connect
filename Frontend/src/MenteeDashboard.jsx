import React, { useEffect, useState } from "react";
import { requestAPI } from "./api";
import "./App.css";

export default function MenteeDashboard() {
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [sentRequests, setSentRequests] = useState([]); // 🟢 Track sent requests
  const [loadingId, setLoadingId] = useState(null);

  // ✅ Fetch recommended mentors (static for now)
  useEffect(() => {
    setRecommendedMentors([
      {
        id: "68f3e3374e7a1090618cb299",
        name: "Harshleen Kaur",
        role: "Full Stack Developer",
        rating: 4.9,
        mentees: 12,
      },
      // { id: "2", name: "Dishavpreet Kaur", role: "Backend Developer", rating: 4.7, mentees: 8 },
    ]);
  }, []);

  // ✅ Fetch mentee's sent requests on load
  useEffect(() => {
    const fetchSentRequests = async () => {
      try {
        const res = await requestAPI.getSent();
        setSentRequests(res); // res should be an array of requests
      } catch (err) {
        console.error("Error fetching sent requests:", err);
      }
    };
    fetchSentRequests();
  }, []);

  // 🧠 Send Request Logic
  const handleSendRequest = async (mentorId) => {
    try {
      setLoadingId(mentorId);
      const res = await requestAPI.send(mentorId);
      alert("✅ Request sent successfully!");

      // 🔄 Update local sent requests immediately
      setSentRequests((prev) => [...prev, res]);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message)
        alert(`⚠️ ${err.response.data.message}`);
      else alert("❌ Failed to send request");
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ Check if request already sent
  const isRequestSent = (mentorId) => {
    return sentRequests.some(
      (req) => req.mentorId?._id === mentorId && req.status === "pending"
    );
  };

  return (
    <main className="container">
      <h1>Mentee Dashboard</h1>

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
        <h2>Welcome, Future Achiever! 🌱</h2>
        <p>Explore mentors, send connection requests, and start learning 🚀</p>
      </div>

      <section className="panel">
        <h2 className="panel-title">Recommended Mentors for You</h2>
        <div
          className="mentor-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          {recommendedMentors.map((m) => {
            const alreadySent = isRequestSent(m.id);
            return (
              <div
                key={m.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px",
                  background: "white",
                }}
              >
                <h3>{m.name}</h3>
                <p>{m.role}</p>
                <p>⭐ {m.rating}</p>
                <button
                  disabled={alreadySent || loadingId === m.id}
                  onClick={() => handleSendRequest(m.id)}
                  style={{
                    width: "100%",
                    background: alreadySent ? "#94a3b8" : "#667eea",
                    color: "white",
                    border: "none",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: alreadySent ? "not-allowed" : "pointer",
                    transition: "0.2s",
                  }}
                >
                  {alreadySent
                    ? "✅ Request Sent"
                    : loadingId === m.id
                    ? "Sending..."
                    : "🤝 Send Request"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
