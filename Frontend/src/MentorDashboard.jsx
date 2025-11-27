// src/MentorDashboard.jsx
import React, { useEffect, useState } from "react";
import { getSocket, initSocket } from "./socket";
import { useNavigate } from "react-router-dom";
import { 
  api, 
  communitiesAPI, 
  requestAPI, 
  feedAPI, 
  leaderboardAPI,
  communityReactionsAPI 
} from "./api";
import "./App.css";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [incoming, setIncoming] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [connections, setConnections] = useState([]);
  const [activityStream, setActivityStream] = useState([]);
  const [stats, setStats] = useState({
    totalMentees: 0,
    totalCommunities: 0,
    totalReactions: 0,
    totalPosts: 0,
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch user profile
        const userData = await api("/user/me", "GET", null, token);
        setUser(userData);

        // Fetch all data in parallel
        const [
          incomingRequests,
          communities,
          connectionsData,
          feedData,
          leaderboardData,
        ] = await Promise.all([
          requestAPI.getIncoming().catch(() => []),
          communitiesAPI.mine().catch(() => []),
          requestAPI.connections(token).catch(() => []),
          feedAPI.my().catch(() => ({ posts: [] })),
          leaderboardAPI.list().catch(() => []),
        ]);

        setIncoming(incomingRequests || []);
        setMyCommunities(communities || []);
        setConnections(connectionsData || []);

        // Calculate statistics
        const totalMentees = connectionsData?.length || 0;
        const totalCommunities = communities?.length || 0;
        
        // Calculate total reactions from feed posts
        let totalReactions = 0;
        const posts = feedData?.posts || [];
        for (const post of posts) {
          if (post.reactionSummary) {
            totalReactions += 
              (post.reactionSummary.thumbsUp || 0) +
              (post.reactionSummary.heart || 0) +
              (post.reactionSummary.fire || 0);
          }
        }

        // Count posts by this mentor
        const totalPosts = posts.filter(
          p => String(p.mentorId?._id || p.mentorId) === String(userData._id)
        ).length;

        setStats({
          totalMentees,
          totalCommunities,
          totalReactions,
          totalPosts,
        });

        // Build activity stream
        const activities = [];
        for (const post of posts.slice(0, 10)) {
          if (post.reactionSummary) {
            const reactionCount = 
              (post.reactionSummary.thumbsUp || 0) +
              (post.reactionSummary.heart || 0) +
              (post.reactionSummary.fire || 0);
            
            if (reactionCount > 0) {
              activities.push({
                type: "reaction",
                user: post.mentorId?.name || "Mentor",
                community: post.communityId?.name || "Community",
                content: post.content?.substring(0, 50) + (post.content?.length > 50 ? "..." : ""),
                count: reactionCount,
                postId: post._id,
                communityId: post.communityId?._id,
              });
            }
          }
          
          if (post.hasPoll) {
            activities.push({
              type: "poll",
              user: post.mentorId?.name || "Mentor",
              community: post.communityId?.name || "Community",
              content: post.content?.substring(0, 50) + (post.content?.length > 50 ? "..." : ""),
              postId: post._id,
              communityId: post.communityId?._id,
            });
          }

          if (post.content && !post.hasPoll && !post.reactionSummary) {
            activities.push({
              type: "post",
              user: post.mentorId?.name || "Mentor",
              community: post.communityId?.name || "Community",
              content: post.content?.substring(0, 50) + (post.content?.length > 50 ? "..." : ""),
              postId: post._id,
              communityId: post.communityId?._id,
            });
          }
        }
        setActivityStream(activities.slice(0, 5));

        // Set leaderboard and find my rank
        if (leaderboardData) {
          setLeaderboard(leaderboardData);
          const myRankData = leaderboardData.find(
            m => String(m.mentorId) === String(userData._id)
          );
          setMyRank(myRankData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Periodically refresh connections to reflect presence from backend
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const list = await requestAPI.connections(token);
        setConnections(list || []);
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Presence updates in real-time
  useEffect(() => {
    const token = localStorage.getItem("token");
    const me = (() => { try { return JSON.parse(localStorage.getItem("user")||"null"); } catch { return null; }})();
    let socket = getSocket();
    if (!socket && me?._id) socket = initSocket(me._id);
    if (!socket) return;

    const handlePresence = ({ userId, isOnline }) => {
      setConnections(prev => prev.map(c => {
        if (String(c.menteeId?._id || c.menteeId) === String(userId)) {
          return {
            ...c,
            menteeId: { ...(c.menteeId || {}), isOnline }
          };
        }
        return c;
      }));
    };
    socket.on("presenceUpdate", handlePresence);
    return () => { socket.off("presenceUpdate", handlePresence); };
  }, []);

  const handleAccept = async (reqId) => {
    try {
      await api(`/requests/${reqId}`, "PATCH", { status: "accepted" });
      setIncoming(prev => prev.filter(r => r._id !== reqId));
      // Refresh connections and stats
      const token = localStorage.getItem("token");
      const connectionsData = await requestAPI.connections(token);
      setConnections(connectionsData || []);
      setStats(prev => ({ ...prev, totalMentees: connectionsData?.length || 0 }));
      alert("Request accepted!");
    } catch (err) {
      alert("Accept failed: " + (err.message || err));
    }
  };

  const handleReject = async (reqId) => {
    try {
      await api(`/requests/${reqId}`, "PATCH", { status: "rejected" });
      setIncoming(prev => prev.filter(r => r._id !== reqId));
      alert("Request rejected");
    } catch (err) {
      alert("Reject failed: " + (err.message || err));
    }
  };

  const handleCreate = async (e) => {
    e?.preventDefault?.();
    try {
      await communitiesAPI.create(createForm);
      setCreateForm({ name: "", description: "" });
      const list = await communitiesAPI.mine();
      setMyCommunities(list || []);
      setStats(prev => ({ ...prev, totalCommunities: list?.length || 0 }));
      alert("Community created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create community");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div>Failed to load user data. Please login again.</div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "M";
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith("http")) return profilePicture;
    return `${import.meta.env.VITE_API_BASE_URL}${profilePicture}`;
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: "24px",
      background: "#f3f4f6",
      minHeight: "100vh"
    }}>
      {/* Welcome Card and Statistics */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "2fr 1fr", 
        gap: "24px",
        marginBottom: "24px"
      }}>
        {/* Welcome Card */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: "bold", color: "#1f2937" }}>
              Welcome back, {user.name}!
            </h2>
            <p style={{ margin: 0, fontSize: "16px", color: "#6b7280" }}>
              {user.skills?.length > 0 ? user.skills.join(", ") : "Mentor"}
            </p>
          </div>
          <div style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: user.profilePicture
              ? `url(${getProfilePictureUrl(user.profilePicture)}) center/cover no-repeat`
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "2rem",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}>
            {!user.profilePicture && getInitials(user.name)}
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px"
        }}>
          {[
            { label: "Total Mentees", value: stats.totalMentees, icon: "👥", color: "#10b981" },
            { label: "Communities", value: stats.totalCommunities, icon: "👨‍👩‍👧‍👦", color: "#10b981" },
            { label: "Reactions", value: stats.totalReactions, icon: "❤️", color: "#ef4444" },
            { label: "Total Posts", value: stats.totalPosts, icon: "📝", color: "#10b981" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ 
                fontSize: "24px", 
                fontWeight: "bold", 
                color: stat.color,
                marginBottom: "4px"
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "24px",
        marginBottom: "24px"
      }}>
        {/* Incoming Requests */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
            Incoming Requests
          </h3>
          {incoming.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "14px" }}>No incoming requests</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {incoming.slice(0, 3).map((r) => (
                <div
                  key={r._id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                    background: "#f9fafb"
                  }}
                >
                  <div style={{ fontWeight: "600", marginBottom: "4px", color: "#1f2937" }}>
                    {r.menteeId?.name || "Unknown mentee"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                    {r.subject || r.message || "Mentorship request"}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleAccept(r._id)}
                      style={{
                        flex: 1,
                        padding: "6px 12px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "500"
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(r._id)}
                      style={{
                        flex: 1,
                        padding: "6px 12px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "500"
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Mentees */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
            My Mentees
          </h3>
          {connections.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "14px" }}>No mentees yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {connections.slice(0, 5).map((conn) => {
                const mentee = conn.menteeId;
                const isOnline = Boolean(mentee?.isOnline);
                return (
                  <div
                    key={conn._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    onClick={() => navigate(`/profile/${mentee?._id || mentee}`)}
                  >
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: mentee?.profilePicture
                        ? `url(${getProfilePictureUrl(mentee.profilePicture)}) center/cover no-repeat`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "14px",
                      flexShrink: 0,
                      position: "relative"
                    }}>
                      {!mentee?.profilePicture && getInitials(mentee?.name || "M")}
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: isOnline ? "#10b981" : "#6b7280",
                        border: "2px solid white"
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "500", fontSize: "14px", color: "#1f2937" }}>
                        {mentee?.name || "Unknown"}
                      </div>
                      <div style={{ fontSize: "12px", color: isOnline ? "#10b981" : "#6b7280" }}>
                        {isOnline ? "Online" : "Offline"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity Stream */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
            Activity Stream
          </h3>
          {activityStream.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "14px" }}>No recent activity</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {activityStream.map((activity, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: "13px",
                    color: "#374151",
                    padding: "8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  onClick={() => {
                    if (activity.communityId) {
                      navigate(`/community-chats/${activity.communityId}`);
                    }
                  }}
                >
                  <strong>{activity.user}</strong> in <strong>{activity.community}</strong>:{" "}
                  {activity.type === "reaction" && (
                    <span>
                      "{activity.content}" ({activity.count} reactions)
                    </span>
                  )}
                  {activity.type === "poll" && (
                    <span>
                      Poll: "{activity.content}"
                    </span>
                  )}
                  {activity.type === "post" && (
                    <span>
                      "{activity.content}"
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Communities and Ranking */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px"
      }}>
        {/* Your Community Chats */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
              Your Community Chats
            </h3>
            <button
              onClick={() => navigate("/community-chats")}
              style={{
                padding: "8px 16px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              Create Community
            </button>
          </div>
          {myCommunities.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "14px" }}>No communities yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {myCommunities.slice(0, 3).map((c) => (
                <div
                  key={c._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  onClick={() => navigate(`/community-chats/${c._id}`)}
                >
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px",
                    flexShrink: 0
                  }}>
                    {getInitials(c.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: "500", fontSize: "14px", color: "#1f2937" }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {(c.members || []).length} members
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community Chats Create Form */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
            Community Chats
          </h3>
          <form onSubmit={handleCreate}>
            <input
              value={createForm.name}
              onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Community name"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                marginBottom: "12px",
                fontSize: "14px"
              }}
              required
            />
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description"
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                marginBottom: "12px",
                fontSize: "14px",
                resize: "vertical"
              }}
              required
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              Create
            </button>
          </form>

          {myCommunities.length > 3 && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
                Your Communities
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {myCommunities.slice(3, 6).map((c) => (
                  <div
                    key={c._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    onClick={() => navigate(`/community-chats/${c._id}`)}
                  >
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "12px",
                      flexShrink: 0
                    }}>
                      {getInitials(c.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, fontSize: "13px", color: "#374151" }}>
                      {c.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Mentor Ranking */}
      {myRank && (
        <div style={{
          marginTop: "24px",
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
            Global Mentor Ranking
          </h3>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "16px",
            background: myRank.rank <= 3 ? "#fef3c7" : "#f9fafb",
            borderRadius: "12px"
          }}>
            <div style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: myRank.rank <= 3 ? "#f59e0b" : "#6b7280",
              minWidth: "40px"
            }}>
              #{myRank.rank}
            </div>
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: user.profilePicture
                ? `url(${getProfilePictureUrl(user.profilePicture)}) center/cover no-repeat`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "600",
              fontSize: "18px",
              flexShrink: 0
            }}>
              {!user.profilePicture && getInitials(user.name)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "600", fontSize: "16px", color: "#1f2937", marginBottom: "4px" }}>
                {user.name} ({myRank.score} points)
              </div>
              {myRank.badges && myRank.badges.length > 0 && (
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  {myRank.badges.join(", ")}
                </div>
              )}
            </div>
          </div>
          {leaderboard.length > 0 && (
            <div style={{ marginTop: "16px", fontSize: "13px", color: "#6b7280", textAlign: "center" }}>
              View full leaderboard on <span 
                style={{ color: "#667eea", cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigate("/leaderboard")}
              >Leaderboard Page</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
