// src/MentorDashboard.jsx
import React, { useEffect, useState } from "react";
import { api } from "./api";

export default function MentorDashboard({ me }) {
  const [incoming, setIncoming] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchIncoming = async () => {
      try {
        // adjust endpoint to fetch incoming requests for mentor
        const res = await api("/requests/incoming", "GET", null, token);
        setIncoming(res);
      } catch (err) {
        console.error("fetch incoming requests:", err);
      }
    };
    fetchIncoming();
  }, []);

  const handleAccept = async (reqId) => {
    try {
      await api(`/requests/${reqId}/accept`, "POST", null, token);
      setIncoming(prev => prev.filter(r => r._id !== reqId));
      alert("Accepted");
    } catch (err) {
      alert("Accept failed: " + (err.message || err));
    }
  };

  const handleReject = async (reqId) => {
    try {
      await api(`/requests/${reqId}/reject`, "POST", null, token);
      setIncoming(prev => prev.filter(r => r._id !== reqId));
      alert("Rejected");
    } catch (err) {
      alert("Reject failed: " + (err.message || err));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Mentor Dashboard</h2>
      <h3>Incoming Requests</h3>
      {incoming.length === 0 && <p>No incoming requests.</p>}
      {incoming.map((r) => (
        <div key={r._id} style={{ border: "1px solid #eee", padding: 12, marginBottom: 8 }}>
          <div><strong>{r.menteeName || r.mentee}</strong></div>
          <div>{r.subject || r.message}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button onClick={() => handleAccept(r._id)}>Accept</button>
            <button onClick={() => handleReject(r._id)}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
