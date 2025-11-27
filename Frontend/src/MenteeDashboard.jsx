import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestAPI, mentorsAPI, recommendationsAPI, communitiesAPI, feedAPI, chatsAPI } from "./api";
import { getSocket } from "./socket";
import "./App.css";

export default function MenteeDashboard() {
  const navigate = useNavigate();
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [sentRequests, setSentRequests] = useState([]); // 🟢 Track sent requests
  const [loadingId, setLoadingId] = useState(null);
  const [trendingCommunities, setTrendingCommunities] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [myCommunityIds, setMyCommunityIds] = useState([]);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const role = (localStorage.getItem("role") || "").toLowerCase();

  // ✅ Fetch recommended mentors dynamically (fallback to top mentors)
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        // try personalized recommendations first
        let list = [];
        try {
          const recs = await recommendationsAPI.mine();
          list = (recs || []).map((r) => ({
            id: r.mentorId,
            name: r.name,
            role: "Mentor",
            rating: r.rating || 0,
            mentees: r.menteesHelped || 0,
            profilePicture: r.profilePicture,
          }));
        } catch (_) {
          // ignore if recommendations not available
        }

        if (!list.length) {
          const res = await mentorsAPI.list({ sort: "rating", limit: 8 });
          const data = res?.data || [];
          list = data.map((m) => ({
            id: m._id || m.id,
            name: m.name,
            role: "Mentor",
            rating: m.rating || 0,
            mentees: m.menteesHelped || 0,
            profilePicture: m.profilePicture,
          }));
        }
        setRecommendedMentors(list);
      } catch (err) {
        console.error("Error loading mentors:", err);
      }
    };
    fetchMentors();
  }, []);

  // ✅ Load community previews and feed
  useEffect(() => {
    const loadCommunitiesAndFeed = async () => {
      try {
        const [trending, mine, feed] = await Promise.all([
          communitiesAPI.trending().catch(() => []),
          communitiesAPI.mine().catch(() => []),
          feedAPI.my().catch(() => ({ posts: [] })),
        ]);

        const topCommunities = (trending || []).slice(0, 3).map((c) => ({
          id: c._id,
          name: c.name,
          members: (c.members?.length) || c.memberCount || 0,
          description: c.description || "",
        }));
        setTrendingCommunities(topCommunities);

        const joinedIds = (mine || []).map((c) => c._id);
        setMyCommunityIds(joinedIds);

        const posts = (feed?.posts || []).slice(0, 5).map((p) => ({
          id: p._id,
          author: p.mentorId?.name || "Mentor",
          community: p.communityId?.name || "Community",
          content: p.content,
        }));
        setFeedItems(posts);
      } catch (err) {
        console.error("Error loading communities/feed:", err);
      }
    };
    loadCommunitiesAndFeed();
  }, []);

  // Actions: create, join, leave
  const handleCreateCommunity = async (e) => {
    e?.preventDefault?.();
    try {
      await communitiesAPI.create(createForm);
      alert("Community created");
      setCreateForm({ name: "", description: "" });
      // refresh trending and my communities
      const [trending, mine] = await Promise.all([
        communitiesAPI.trending().catch(() => []),
        communitiesAPI.mine().catch(() => []),
      ]);
      const topCommunities = (trending || []).slice(0, 3).map((c) => ({
        id: c._id,
        name: c.name,
        members: (c.members?.length) || c.memberCount || 0,
        description: c.description || "",
      }));
      setTrendingCommunities(topCommunities);
      setMyCommunityIds((mine || []).map((c) => c._id));
    } catch (err) {
      console.error(err);
      alert("Failed to create community");
    }
  };

  const handleJoinCommunity = async (id) => {
    try {
      await communitiesAPI.join(id);
      setMyCommunityIds((prev) => Array.from(new Set([...prev, id])));
      alert("Joined community");
    } catch (err) {
      console.error(err);
      alert("Failed to join community");
    }
  };

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

  // ✅ Listen for real-time request status updates via socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleRequestSent = (data) => {
      // Update local state when request is sent
      setSentRequests((prev) => {
        const exists = prev.some((req) => req._id === data.requestId);
        if (exists) return prev;
        return [...prev, { _id: data.requestId, mentorId: { _id: data.mentorId }, status: data.status }];
      });
    };

    const handleRequestStatusChanged = (data) => {
      // Update local state when request status changes (accepted/rejected)
      setSentRequests((prev) =>
        prev.map((req) =>
          req._id === data.requestId || req.mentorId?._id === data.mentorId
            ? { ...req, status: data.status }
            : req
        )
      );
    };

    socket.on("requestSent", handleRequestSent);
    socket.on("requestStatusChanged", handleRequestStatusChanged);

    return () => {
      socket.off("requestSent", handleRequestSent);
      socket.off("requestStatusChanged", handleRequestStatusChanged);
    };
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

  // ✅ Check if request is accepted
  const isRequestAccepted = (mentorId) => {
    return sentRequests.some(
      (req) => req.mentorId?._id === mentorId && req.status === "accepted"
    );
  };

  // ✅ Handle starting a chat with mentor
  const handleStartChat = async (mentorId) => {
    try {
      setLoadingId(mentorId);
      const chat = await chatsAPI.start(mentorId);
      navigate(`/messages?chatId=${chat._id}`);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to start chat");
    } finally {
      setLoadingId(null);
    }
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <h2 className="panel-title" style={{ margin: 0 }}>Recommended Mentors for You</h2>
          <button
            onClick={() => navigate("/mentors/recommended")}
            style={{
              border: "none",
              background: "transparent",
              color: "#667eea",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            View more →
          </button>
        </div>
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
            const accepted = isRequestAccepted(m.id);
            return (
              <div
                key={m.id}
                onClick={(e) => {
                  // Don't navigate if clicking on the button
                  if (e.target.closest('button')) {
                    return;
                  }
                  navigate(`/profile/${m.id}`);
                }}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px",
                  background: "white",
                  transition: "all 0.2s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                  {/* Profile Picture */}
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: m.profilePicture
                      ? `url(${import.meta.env.VITE_API_BASE_URL}${m.profilePicture}) center/cover no-repeat`
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}>
                    {!m.profilePicture && (m.name ? m.name.split(" ").map(n => n[0]).slice(0, 2).join("") : "M")}
                  </div>
                  
                  {/* Mentor Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: "0 0 4px 0", cursor: "pointer", textDecoration: "underline", fontSize: "1.1rem" }}>
                      {m.name}
                    </h3>
                    <p style={{ margin: "2px 0", color: "#64748b", fontSize: "0.9rem" }}>{m.role}</p>
                    <p style={{ margin: "2px 0", fontSize: "0.9rem" }}>⭐ {m.rating}</p>
                    <p style={{ margin: "2px 0", color: "#64748b", fontSize: "0.85rem" }}>
                      {m.mentees} mentees helped
                    </p>
                  </div>
                </div>
                {accepted ? (
                  <button
                    disabled={loadingId === m.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartChat(m.id);
                    }}
                    style={{
                      width: "100%",
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: loadingId === m.id ? "wait" : "pointer",
                      transition: "0.2s",
                    }}
                  >
                    {loadingId === m.id ? "Starting..." : "💬 Start Chat"}
                  </button>
                ) : (
                  <button
                    disabled={alreadySent || loadingId === m.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendRequest(m.id);
                    }}
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
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="two-col">
        <div className="panel">
          {role === "mentor" && (
            <div style={{ marginBottom: 16, border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
              <h3 style={{ marginTop: 0 }}>Create a Community</h3>
              <form onSubmit={handleCreateCommunity}>
                <input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Community name"
                  style={{ width: "100%", padding: 10, border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 8 }}
                  required
                />
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Description"
                  rows={3}
                  style={{ width: "100%", padding: 10, border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 8 }}
                  required
                />
                <button type="submit" style={{ padding: "10px 16px", background: "#10b981", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
                  Create
                </button>
              </form>
            </div>
          )}
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
              {trendingCommunities.reduce((sum, c) => sum + c.members, 0)} online
            </span>
          </div>
          <div className="chat-list">
            {trendingCommunities.map((c) => (
              <div key={c.id} style={{ border: "1px solid #e2e8f0", padding: 12, borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ color: "#64748b", fontSize: 14 }}>{c.description}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{c.members} members</span>
                  {role === "mentee" && (
                    myCommunityIds.includes(c.id) ? (
                      <button disabled style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f1f5f9", color: "#64748b" }}>
                        Joined
                      </button>
                    ) : (
                      <button onClick={() => handleJoinCommunity(c.id)} style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "#667eea", color: "white", cursor: "pointer" }}>
                        Join
                      </button>
                    )
                  )}
                </div>
              </div>
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
            {feedItems.map((f) => (
              <div key={f.id} style={{ border: "1px solid #e2e8f0", padding: 12, borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <strong>{f.author}</strong>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{f.community}</span>
                </div>
                <div style={{ color: "#374151" }}>{f.content}</div>
              </div>
            ))}
            {feedItems.length === 0 && <div style={{ color: "#64748b" }}>Join communities to see posts.</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
