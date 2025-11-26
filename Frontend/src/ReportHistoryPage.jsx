import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";

export default function ReportHistoryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [givenReviews] = useState([]); // For now, mentees can't see their given reviews without a backend endpoint
  const [connections, setConnections] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    acceptedRequests: 0,
    pendingRequests: 0,
    rejectedRequests: 0,
    totalReviews: 0,
    averageRating: 0,
    totalConnections: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch user data
      const userResponse = await api("/user/me", "GET");
      setUser(userResponse);
      setUserRole(userResponse.role);

      // Fetch requests
      const [sentRes, incomingRes] = await Promise.all([
        api("/requests/sent", "GET").catch(() => []),
        userResponse.role === "mentor"
          ? api("/requests/incoming", "GET").catch(() => [])
          : Promise.resolve([]),
      ]);

      setSentRequests(Array.isArray(sentRes) ? sentRes : []);
      setIncomingRequests(Array.isArray(incomingRes) ? incomingRes : []);

      // Fetch reviews
      if (userResponse.role === "mentor") {
        // Get reviews for this mentor
        const reviewsRes = await api(`/reviews/${userResponse._id}`, "GET").catch(() => ({ reviews: [] }));
        const reviewsList = Array.isArray(reviewsRes) ? reviewsRes : reviewsRes?.reviews || [];
        setReviews(reviewsList);
      } else {
        // For mentees, we can't easily get all reviews given
        // This would require a backend endpoint, for now set empty
        setGivenReviews([]);
      }

      // Fetch connections
      let connectionsData = [];
      if (userResponse.role === "mentor") {
        const connectionsRes = await api("/connections", "GET").catch(() => []);
        connectionsData = Array.isArray(connectionsRes) ? connectionsRes : [];
        setConnections(connectionsData);
      }

      // Calculate stats
      const allRequests = userResponse.role === "mentor" ? incomingRes : sentRes;
      const acceptedCount = allRequests.filter((r) => r.status === "accepted").length;
      const pendingCount = allRequests.filter((r) => r.status === "pending").length;
      const rejectedCount = allRequests.filter((r) => r.status === "rejected").length;
      const reviewsList = userResponse.role === "mentor" ? reviews : givenReviews;
      const avgRating =
        reviewsList.length > 0
          ? reviewsList.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsList.length
          : 0;

      setStats({
        totalRequests: allRequests.length,
        acceptedRequests: acceptedCount,
        pendingRequests: pendingCount,
        rejectedRequests: rejectedCount,
        totalReviews: reviewsList.length,
        averageRating: avgRating,
        totalConnections: userResponse.role === "mentor" ? connectionsData.length : acceptedCount,
      });
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <p>Loading report history...</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem", color: "#2c3e50" }}>
        📊 Report History
      </h1>

      {/* Statistics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
          }}
        >
          <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "0.5rem" }}>
            {userRole === "mentor" ? "Mentees Helped" : "Mentors Connected"}
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.totalConnections}</div>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
          }}
        >
          <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "0.5rem" }}>Accepted Requests</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.acceptedRequests}</div>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
          }}
        >
          <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "0.5rem" }}>Pending Requests</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.pendingRequests}</div>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
          }}
        >
          <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "0.5rem" }}>Rejected Requests</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.rejectedRequests}</div>
        </div>
        {userRole === "mentor" && (
          <div
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
              padding: "1.5rem",
              borderRadius: "12px",
              color: "white",
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
            }}
          >
            <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "0.5rem" }}>Average Rating</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
            </div>
          </div>
        )}
        <div
          style={{
            background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
          }}
        >
          <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "0.5rem" }}>
            {userRole === "mentor" ? "Reviews Received" : "Reviews Given"}
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.totalReviews}</div>
        </div>
      </div>

      {/* Connections/Requests Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        {/* Sent Requests (Mentee) or Incoming Requests (Mentor) */}
        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem", color: "#2c3e50" }}>
            {userRole === "mentor" ? "📥 Incoming Requests" : "📤 Sent Requests"}
          </h2>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {(userRole === "mentor" ? incomingRequests : sentRequests).length === 0 ? (
              <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>No requests yet</p>
            ) : (
              (userRole === "mentor" ? incomingRequests : sentRequests).map((request) => {
                const otherUser = userRole === "mentor" ? request.menteeId : request.mentorId;
                const userName = otherUser?.name || "Unknown User";
                const status = request.status;

                return (
                  <div
                    key={request._id}
                    style={{
                      padding: "1rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      marginBottom: "0.75rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{userName}</div>
                      <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                        {new Date(request.createdAt || request.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        background:
                          status === "accepted"
                            ? "#d1fae5"
                            : status === "pending"
                            ? "#fef3c7"
                            : "#fee2e2",
                        color:
                          status === "accepted"
                            ? "#065f46"
                            : status === "pending"
                            ? "#92400e"
                            : "#991b1b",
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Connections (Mentor) or Accepted Requests (Mentee) */}
        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem", color: "#2c3e50" }}>
            {userRole === "mentor" ? "👥 Active Connections" : "✅ Accepted Connections"}
          </h2>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {(userRole === "mentor"
              ? connections
              : sentRequests.filter((r) => r.status === "accepted")
            ).length === 0 ? (
              <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>No connections yet</p>
            ) : (
              (userRole === "mentor"
                ? connections
                : sentRequests.filter((r) => r.status === "accepted")
              ).map((item) => {
                const otherUser = userRole === "mentor" ? item.menteeId : item.mentorId;
                const userName = otherUser?.name || "Unknown User";

                return (
                  <div
                    key={item._id || item.mentorId?._id || item.menteeId?._id}
                    style={{
                      padding: "1rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      marginBottom: "0.75rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{userName}</div>
                      <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                        Connected {new Date(item.createdAt || item.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/messages")}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#667eea",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      Message
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem", color: "#2c3e50" }}>
          {userRole === "mentor" ? "⭐ Reviews Received" : "⭐ Reviews Given"}
        </h2>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {(userRole === "mentor" ? reviews : givenReviews).length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>
              {userRole === "mentor" ? "No reviews received yet" : "No reviews given yet"}
            </p>
          ) : (
            (userRole === "mentor" ? reviews : givenReviews).map((review) => {
              const otherUser = userRole === "mentor" ? review.menteeId : review.mentorId;
              const userName = otherUser?.name || "Unknown User";

              return (
                <div
                  key={review._id}
                  style={{
                    padding: "1rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                    <div>
                      <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{userName}</div>
                      <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                        {new Date(review.timestamp || review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ fontSize: "1.2rem", color: i < review.rating ? "#fbbf24" : "#d1d5db" }}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <div style={{ color: "#475569", fontSize: "0.95rem", marginTop: "0.5rem" }}>{review.comment}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
