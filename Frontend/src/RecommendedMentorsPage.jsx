import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mentorsAPI, recommendationsAPI, requestAPI, chatsAPI } from "./api";
import { getSocket } from "./socket";

const normalizeMentor = (m) => {
  const id = m._id || m.id || m.mentorId || m.userId || m.profileId;
  return {
    id,
    name: m.name || `${m.firstName || ""} ${m.lastName || ""}`.trim() || "Mentor",
    rating: m.rating ?? 0,
    avgRating: m.avgRating ?? m.rating ?? 0,
    mentees: m.menteesHelped ?? m.mentees ?? m.stats?.menteesHelped ?? 0,
    skills: m.skills || m.expertise || [],
    matchingSkills: m.matchingSkills || [],
    profilePicture: m.profilePicture,
    bio: m.bio,
    branch: m.branch,
    verifiedMentor: m.verifiedMentor || false,
    // Scores
    finalScore: m.finalScore ?? 0,
    similarity: m.similarity ?? 0,
    interactionScore: m.interactionScore ?? 0,
    ratingScore: m.ratingScore ?? 0,
    menteesHelpedScore: m.menteesHelpedScore ?? 0,
    communityActivityScore: m.communityActivityScore ?? 0,
    reviewCount: m.reviewCount ?? 0,
    hasExistingRequest: m.hasExistingRequest ?? false,
  };
};

export default function RecommendedMentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [recommendedIds, setRecommendedIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState({});
  const [limit, setLimit] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [recRes, allRes, sent] = await Promise.all([
          recommendationsAPI
            .mine({ limit })
            .catch(() => ({ recommendations: [] })),
          mentorsAPI.list({ sort: "rating" }),
          requestAPI.getSent().catch(() => []),
        ]);

        // Handle new API response format
        const recommendationsData = recRes?.recommendations || recRes?.data || (Array.isArray(recRes) ? recRes : []);
        const recommendedRaw = Array.isArray(recommendationsData) ? recommendationsData : [];
        const allRaw = Array.isArray(allRes?.data) ? allRes.data : Array.isArray(allRes) ? allRes : [];

        const recommendedList = recommendedRaw.map(normalizeMentor).filter((m) => m.id);
        const allList = (allRaw || []).map(normalizeMentor).filter((m) => m.id);

        const recIdSet = new Set(recommendedList.map((m) => m.id));
        setRecommendedIds(recIdSet);

        const merged = [];
        const seen = new Set();
        
        // Add recommended mentors first (sorted by finalScore)
        recommendedList
          .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
          .forEach((m) => {
            if (!seen.has(m.id)) {
              merged.push(m);
              seen.add(m.id);
            }
          });
        
        // Add other mentors sorted by rating
        allList
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .forEach((m) => {
            if (!seen.has(m.id)) {
              merged.push(m);
              seen.add(m.id);
            }
          });

        setMentors(merged);
        setSentRequests(sent || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load mentors");
      }
    };
    load();
  }, [limit]);

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

  const filteredMentors = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return mentors;
    return mentors.filter((m) => (m.name || "").toLowerCase().includes(query));
  }, [mentors, search]);

  const isRequestSent = (mentorId) =>
    sentRequests.some((req) => req.mentorId?._id === mentorId && req.status === "pending");

  const isRequestAccepted = (mentorId) =>
    sentRequests.some((req) => req.mentorId?._id === mentorId && req.status === "accepted");

  const handleSendRequest = async (mentorId) => {
    try {
      setLoadingId(mentorId);
      const res = await requestAPI.send(mentorId);
      setSentRequests((prev) => [...prev, res]);
      alert("Request sent successfully");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to send request");
    } finally {
      setLoadingId(null);
    }
  };

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

  const toggleDetails = (mentorId) => {
    setShowDetails((prev) => ({
      ...prev,
      [mentorId]: !prev[mentorId],
    }));
  };

  const formatScore = (score) => {
    return ((score || 0) * 100).toFixed(1);
  };

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>Recommended Mentors</h1>
          <p style={{ color: "#64748b", marginTop: 4 }}>
            Advanced AI-powered recommendations using cosine similarity, interactions, ratings, reviews, and community activity.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              outline: "none",
              background: "white",
            }}
          >
            <option value={5}>Show 5</option>
            <option value={10}>Show 10</option>
            <option value={20}>Show 20</option>
            <option value={50}>Show 50</option>
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mentors by name"
            style={{
              minWidth: 260,
              padding: "0.75rem 1rem",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              outline: "none",
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: 8, marginBottom: "1rem" }}>{error}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {filteredMentors.map((mentor) => {
          const alreadySent = isRequestSent(mentor.id) || mentor.hasExistingRequest;
          const accepted = isRequestAccepted(mentor.id);
          const isRecommended = recommendedIds.has(mentor.id);
          const showMentorDetails = showDetails[mentor.id];
          return (
            <div
              key={mentor.id}
              style={{
                border: isRecommended ? "2px solid #667eea" : "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 18,
                background: "white",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                boxShadow: isRecommended ? "0 4px 12px rgba(102, 126, 234, 0.15)" : "0 2px 4px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: mentor.profilePicture
                      ? `url(${import.meta.env.VITE_API_BASE_URL}${mentor.profilePicture}) center/cover no-repeat`
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                    border: mentor.verifiedMentor ? "3px solid #10b981" : "none",
                  }}
                >
                  {!mentor.profilePicture && (mentor.name ? mentor.name.split(" ").map((n) => n[0]).slice(0, 2).join("") : "M")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "#1f2937",
                        fontWeight: 600,
                        fontSize: "1rem",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/profile/${mentor.id}`)}
                    >
                      {mentor.name}
                    </button>
                    {mentor.verifiedMentor && (
                      <span style={{ background: "#d1fae5", color: "#065f46", padding: "2px 6px", borderRadius: 6, fontSize: 11, fontWeight: 500 }}>
                        ✓ Verified
                      </span>
                    )}
                    {isRecommended && (
                      <span style={{ background: "#eef2ff", color: "#4338ca", padding: "2px 6px", borderRadius: 6, fontSize: 11, fontWeight: 500 }}>
                        ⭐ Recommended
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                    ⭐ {mentor.avgRating > 0 ? mentor.avgRating.toFixed(1) : mentor.rating.toFixed(1)} 
                    {mentor.reviewCount > 0 && ` (${mentor.reviewCount} reviews)`}
                    &nbsp;•&nbsp; {mentor.mentees} mentees
                  </div>
                  {isRecommended && mentor.finalScore > 0 && (
                    <div style={{ fontSize: 12, color: "#667eea", fontWeight: 500, marginTop: 4 }}>
                      Match Score: {formatScore(mentor.finalScore)}%
                    </div>
                  )}
                  {mentor.matchingSkills?.length > 0 && (
                    <div style={{ fontSize: 12, color: "#4b5563", marginTop: 6 }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>Matching Skills:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {mentor.matchingSkills.slice(0, 4).map((skill) => (
                          <span key={skill} style={{ background: "#eef2ff", color: "#4338ca", padding: "2px 6px", borderRadius: 6, fontSize: 11 }}>
                            {skill}
                          </span>
                        ))}
                        {mentor.matchingSkills.length > 4 && (
                          <span style={{ color: "#6b7280", fontSize: 11 }}>+{mentor.matchingSkills.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  {mentor.skills?.length > 0 && mentor.matchingSkills?.length === 0 && (
                    <div style={{ fontSize: 12, color: "#4b5563", marginTop: 4 }}>
                      {mentor.skills.slice(0, 3).map((skill) => (
                        <span key={skill} style={{ marginRight: 6, background: "#f3f4f6", padding: "2px 6px", borderRadius: 6 }}>{skill}</span>
                      ))}
                    </div>
                  )}
                  {mentor.bio && (
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6, fontStyle: "italic", lineHeight: 1.4 }}>
                      {mentor.bio.length > 80 ? `${mentor.bio.substring(0, 80)}...` : mentor.bio}
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Score Details */}
              {isRecommended && (
                <button
                  onClick={() => toggleDetails(mentor.id)}
                  style={{
                    background: "none",
                    border: "1px solid #e2e8f0",
                    padding: "8px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#667eea",
                    fontWeight: 500,
                  }}
                >
                  {showMentorDetails ? "▼ Hide Details" : "▶ Show Recommendation Details"}
                </button>
              )}

              {showMentorDetails && isRecommended && (
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: "#1f2937" }}>Recommendation Breakdown:</div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#6b7280" }}>Skill Similarity:</span>
                      <span style={{ fontWeight: 500, color: "#4338ca" }}>{formatScore(mentor.similarity)}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#6b7280" }}>Interaction Score:</span>
                      <span style={{ fontWeight: 500, color: "#4338ca" }}>{formatScore(mentor.interactionScore)}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#6b7280" }}>Rating Score:</span>
                      <span style={{ fontWeight: 500, color: "#4338ca" }}>{formatScore(mentor.ratingScore)}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#6b7280" }}>Mentees Helped Score:</span>
                      <span style={{ fontWeight: 500, color: "#4338ca" }}>{formatScore(mentor.menteesHelpedScore)}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#6b7280" }}>Community Activity:</span>
                      <span style={{ fontWeight: 500, color: "#4338ca" }}>{formatScore(mentor.communityActivityScore)}%</span>
                    </div>
                    <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                      <span style={{ color: "#1f2937" }}>Final Match Score:</span>
                      <span style={{ color: "#667eea", fontSize: 14 }}>{formatScore(mentor.finalScore)}%</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  style={{
                    flex: 1,
                    padding: "0.55rem 0.9rem",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "white",
                    color: "#1f2937",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/profile/${mentor.id}`)}
                >
                  View Profile
                </button>
                {accepted ? (
                  <button
                    style={{
                      flex: 1,
                      padding: "0.55rem 0.9rem",
                      borderRadius: 8,
                      border: "none",
                      background: "#10b981",
                      color: "white",
                      cursor: loadingId === mentor.id ? "wait" : "pointer",
                    }}
                    disabled={loadingId === mentor.id}
                    onClick={() => handleStartChat(mentor.id)}
                  >
                    {loadingId === mentor.id ? "Starting..." : "💬 Start Chat"}
                  </button>
                ) : (
                  <button
                    style={{
                      flex: 1,
                      padding: "0.55rem 0.9rem",
                      borderRadius: 8,
                      border: "none",
                      background: alreadySent ? "#94a3b8" : "#667eea",
                      color: "white",
                      cursor: alreadySent ? "not-allowed" : "pointer",
                    }}
                    disabled={alreadySent || loadingId === mentor.id}
                    onClick={() => handleSendRequest(mentor.id)}
                  >
                    {alreadySent ? "Request Sent" : loadingId === mentor.id ? "Sending..." : "Send Request"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredMentors.length === 0 && !loadingId && (
        <div style={{ marginTop: "2rem", textAlign: "center", color: "#6b7280" }}>No mentors matched your search.</div>
      )}
    </main>
  );
}
