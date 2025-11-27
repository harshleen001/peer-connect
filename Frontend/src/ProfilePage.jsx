// Frontend/src/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { api, requestAPI } from "./api"; // your api wrapper (uses VITE_API_BASE_URL)


const FollowerCard = ({ follower }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    background: "#f8f9fa",
    borderRadius: "12px",
    border: "1px solid #e9ecef"
  }}>
    <div style={{
      width: "50px",
      height: "50px",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "bold",
      fontSize: "1rem"
    }}>
      {follower.avatar}
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>{follower.name}</h4>
      <p style={{ margin: "0.25rem 0 0 0", color: "#6c757d", fontSize: "0.9rem" }}>{follower.role}</p>
    </div>
    <button style={{
      padding: "0.5rem 1rem",
      background: "#667eea",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "0.9rem"
    }}>
      View Profile
    </button>
  </div>
);





function SentRequestsSection() {
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api("/requests/sent", "GET", null, token);
      setSentRequests(res);
    } catch (err) {
      console.error("Error fetching sent requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const cancelRequest = async (requestId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/requests/${requestId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel request");
      }

      alert("Request cancelled successfully!");
      // Optionally refresh list
      setSentRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error("Cancel request error:", err);
      alert(err.message);
    }
  };


  if (loading) return <p>Loading requests...</p>;
  if (!sentRequests.length) return <p>No requests sent yet.</p>;

  const getColor = (status) =>
    status === "accepted"
      ? "#27ae60"
      : status === "rejected"
        ? "#e74c3c"
        : "#f39c12";

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {sentRequests.map((req) => (
        <div
          key={req._id}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "1rem",
            position: "relative",
            background: "#fff",
          }}
        >
          <h3 style={{ margin: 0 }}>{req.mentorId?.name}</h3>
          <p style={{ margin: "4px 0" }}>{req.mentorId?.email}</p>
          <p style={{ margin: "4px 0" }}>⭐ {req.mentorId?.rating || "N/A"}</p>
          <p style={{ margin: "4px 0" }}>
            Status:{" "}
            <strong style={{ color: getColor(req.status) }}>
              {req.status.toUpperCase()}
            </strong>
          </p>

          {/* ❌ Cancel Button (only for pending requests) */}
          {req.status === "pending" && (
            <button
              onClick={() => cancelRequest(req._id)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#f8d7da",
                border: "1px solid #f5c2c7",
                color: "#b02a37",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              ❌ Cancel
            </button>
          )}
        </div>
      ))}
    </div>
  );
}





export default function ProfilePage() {

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  // Demo followers (same as your sample)
  const followersData = [
    { id: 1, name: "Rohit Sharma", avatar: "RS", role: "Frontend Developer" },
    { id: 2, name: "Priya Patel", avatar: "PP", role: "Aspiring Developer" },
    { id: 3, name: "Arjun Gupta", avatar: "AG", role: "Data Scientist" },
    { id: 4, name: "Sneha Reddy", avatar: "SR", role: "Backend Developer" }
  ];

  const token = localStorage.getItem("token");

  useEffect(() => {
    // fetch logged-in user profile
    const fetchMe = async () => {
      try {
        setLoading(true);
        const res = await api("/user/me", "GET", null, token); // expects backend route /user/me
        setUser(res);
        // initialize form with editable fields
        setForm({
          name: res.name || "",
          phone: res.phone || "",
          address: res.address || "",
          bio: res.bio || "",
          branch: res.branch || "",
          year: res.year || "Other",
          resumeLink: res.resumeLink || "",
          profilePicture: res.profilePicture || "",
          skills: res.skills || [],
          interests: res.interests || [],
          achievements: res.achievements || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        alert("Failed to load profile. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("token");
      if (!user || !user.role) return;

      try {
        if (user.role.toLowerCase() === "mentor") {
          const res = await requestAPI.getIncoming();
          setIncomingRequests(res);
          console.log("✅ Incoming requests fetched:", res);
        } else if (user.role.toLowerCase() === "mentee") {
          const res = await requestAPI.getSent();
          setOutgoingRequests(res);
          console.log("✅ Sent requests fetched:", res);
        }
      } catch (err) {
        console.error("❌ Error fetching requests:", err.message);
      }
    };

    fetchRequests();
  }, [user]);



  const getSkillLevelColor = (level) => {
    switch ((level || "").toLowerCase()) {
      case "expert": return "#27ae60";
      case "advanced": return "#f39c12";
      case "intermediate": return "#3498db";
      case "beginner": return "#e74c3c";
      default: return "#95a5a6";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only send allowed fields (backend will also validate)
      const payload = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        bio: form.bio,
        branch: form.branch,
        year: form.year,
        resumeLink: form.resumeLink,
        profilePicture: form.profilePicture,
        skills: form.skills,
        interests: form.interests,
        achievements: form.achievements,
      };

      const res = await api("/user/me", "PATCH", payload, token);
      setUser(res); // backend returns updated user
      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save profile: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };
  const [connections, setConnections] = useState([]);
  const [showConnections, setShowConnections] = useState(false);

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await requestAPI.connections(token);
      setConnections(res);
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  useEffect(() => {
    if (showConnections) fetchConnections();
  }, [showConnections]);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);
  const handleRemoveConnection = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await requestAPI.removeConnection(id, token);
      setConnections((prev) => prev.filter((c) => c._id !== id));
      alert("Connection removed successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to remove connection");
    }
  };



  // UI for editing resume/profile picture currently accepts URLs — upload flow is step 2.
  if (loading) return <div style={{ padding: 40 }}>Loading profile...</div>;
  if (!user) return <div style={{ padding: 40 }}>No profile available.</div>;

  const handleAccept = async (id) => {
    try {
      await api(`/requests/${id}`, "PATCH", { status: "accepted" });
      alert("Request accepted!");
      setIncomingRequests((prev) =>
        prev.filter((r) => r._id !== id)
      );
    } catch (err) {
      console.error("Accept error:", err);
      alert("Failed to accept request");
    }
  };

  const handleReject = async (id) => {
    try {
      await api(`/requests/${id}`, "PATCH", { status: "rejected" });
      alert("Request rejected!");
      setIncomingRequests((prev) =>
        prev.filter((r) => r._id !== id)
      );
    } catch (err) {
      console.error("Reject error:", err);
      alert("Failed to reject request");
    }
  };


  return (
    <div style={{ background: "#f5f7fa", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif" }}>
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        {/* Profile Header */}
        <div style={{ background: "white", borderRadius: "20px", padding: "2rem", marginBottom: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e9ecef" }}>
          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
            {/* Avatar */}
            <div style={{
              width: "120px",
              height: "120px",
              background: user.profilePicture
                ? `url(${import.meta.env.VITE_API_BASE_URL}${user.profilePicture}) center/cover no-repeat`
                : "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "2.5rem",
              flexShrink: 0
            }}>
              {!user.profilePicture && (user.name ? user.name.split(" ").map(n => n[0]).slice(0, 2).join("") : "U")}
            </div>


            {/* User Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "bold", color: "#2c3e50" }}>{user.name}</h1>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    {user.address && <span style={{ color: "#6c757d", fontSize: "1rem" }}>📍 {user.address}</span>}
                    <span style={{ color: "#6c757d", fontSize: "1rem" }}>{user.role} {user.company ? `at ${user.company}` : ""}</span>
                    <span style={{ color: "#6c757d", fontSize: "1rem" }}>📅 Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={() => {
                      if (isEditing) {
                        // Save
                        handleSave();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: isEditing ? "#27ae60" : "#667eea",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "500"
                    }}
                  >
                    {isEditing ? (saving ? "Saving..." : "Save Changes") : "Edit Profile"}
                  </button>

                  {isEditing && (
                    <button onClick={() => { setIsEditing(false); /* discard local changes by reloading user*/ setForm(prev => ({ ...prev, name: user.name, phone: user.phone || "", address: user.address || "", bio: user.bio || "" })) }}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {/* File Uploads — show only while editing */}
                {isEditing && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                    <div>
                      <label style={{ fontWeight: 600 }}>Profile Picture Upload</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append("profilePicture", file);

                          try {
                            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/upload/profile-picture`, {
                              method: "POST",
                              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                              body: formData,
                            });
                            const data = await res.json();
                            if (res.ok) {
                              alert("Profile picture updated!");
                              setUser((prev) => ({ ...prev, profilePicture: data.profilePicture }));
                              setForm((prev) => ({ ...prev, profilePicture: data.profilePicture }));

                            } else {
                              alert(data.message || "Upload failed");
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Upload failed");
                          }
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontWeight: 600 }}>Upload Resume (PDF)</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append("resume", file);

                          try {
                            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/upload/resume`, {
                              method: "POST",
                              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                              body: formData,
                            });
                            const data = await res.json();
                            if (res.ok) {
                              alert("Resume uploaded!");
                              setUser((prev) => ({ ...prev, resumeLink: data.resumeLink }));
                              setForm((prev) => ({ ...prev, resumeLink: data.resumeLink }));

                            } else {
                              alert(data.message || "Upload failed");
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Upload failed");
                          }
                        }}
                      />
                    </div>
                  </div>
                )}


              </div>


              <div style={{ padding: "2rem" }}>
                {/* Profile Stats Section */}
                <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
                  {user.role === "mentor" ? (
                    <>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea", cursor: "pointer" }}
                          onClick={() => {
                            fetchConnections();
                            setShowConnections(true);
                          }}
                        >
                          {connections.length}
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Mentees</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea", cursor: "pointer" }}
                          onClick={() => {
                            fetchConnections();
                            setShowConnections(true);
                          }}
                        >
                          {connections.length}
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Mentors</div>
                      </div>
                    </>
                  )}
                </div>

                {/* ✅ Connections Modal */}
                {showConnections && (
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(0,0,0,0.6)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1000,
                    }}
                    onClick={() => setShowConnections(false)}

                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "2rem",
                        width: "400px",
                        maxHeight: "70vh",
                        overflowY: "auto",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      }}
                    >
                      <h3>🤝 Your Connections</h3>
                      {connections.length === 0 ? (
                        <p>No active connections yet.</p>
                      ) : (
                        connections.map((c) => {
                          const person = user.role === "mentor" ? c.menteeId : c.mentorId;

                          return (
                            <div
                              key={c._id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: "1rem",
                                padding: "0.8rem",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                              }}
                            >
                              <div
                                style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                                onClick={() => (window.location.href = `/profile/${person._id}`)}
                              >
                                <img
                                  src={person.profilePicture || "/default-avatar.png"}
                                  alt="avatar"
                                  style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "0.8rem" }}
                                />
                                <div>
                                  <div style={{ fontWeight: "bold" }}>{person.name}</div>
                                  <div style={{ fontSize: "0.85rem", color: "#555" }}>{person.email}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveConnection(c._id)}
                                style={{
                                  background: "#ff6b6b",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  padding: "6px 10px",
                                  cursor: "pointer",
                                }}
                              >
                                ❌
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bio or editable bio */}
              {!isEditing && <p style={{ color: "#495057", lineHeight: "1.6", fontSize: "1rem", margin: 0 }}>{user.bio || "No bio yet."}</p>}
              {isEditing && (
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                  style={{ width: "100%", minHeight: 80, marginTop: 12, padding: 12, borderRadius: 8 }}
                />
              )}

              {user.resumeLink && (
                <p style={{ marginTop: "1rem" }}>
                  📄 <a
                    href={`${import.meta.env.VITE_API_BASE_URL}${user.resumeLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >


                    View Resume
                  </a>
                </p>
              )}

            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", background: "#f8f9fa", padding: "0.5rem", borderRadius: "12px" }}>
          {["overview", "skills", user.role === "mentor" ? "followers" : "following"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === tab ? "#667eea" : "transparent",
              color: activeTab === tab ? "white" : "#6c757d",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              textTransform: "capitalize",
              transition: "all 0.3s ease"
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ background: "white", borderRadius: "16px", padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e9ecef", minHeight: "400px" }}>
          {activeTab === "overview" && (
            <div>
              <h2 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>{user.role === "mentor" ? "Mentoring Overview" : "Learning Journey"}</h2>

              {/* Show editable fields summary when editing (phone, branch, year, resume/link) */}
              {isEditing ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontWeight: 600 }}>Full name</label>
                    <input name="name" value={form.name} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 8 }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600 }}>Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 8 }} />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600 }}>Branch</label>
                    <input name="branch" value={form.branch} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 8 }} />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600 }}>Year</label>
                    <select name="year" value={form.year} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 8 }}>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontWeight: 600 }}>Address</label>
                    <input name="address" value={form.address} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 8 }} />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontWeight: 600 }}>Resume Link (URL)</label>
                    <input name="resumeLink" value={form.resumeLink} onChange={handleChange} placeholder="https://..." style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 8 }} />
                    <small style={{ color: "#6c757d" }}>You can upload resume later and paste URL here (or use step 2 upload flow).</small>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontWeight: 600 }}>Profile Picture URL</label>
                    <input name="profilePicture" value={form.profilePicture} onChange={handleChange} placeholder="https://..." style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 8 }} />
                    <small style={{ color: "#6c757d" }}>You can upload picture later and paste URL here (or use step 2 upload flow).</small>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontWeight: 600 }}>Achievements</label>
                    <textarea name="achievements" value={form.achievements} onChange={handleChange} style={{ width: "100%", minHeight: 80, padding: 10, borderRadius: 8, marginTop: 8 }} />
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
                    <div>
                      <h3 style={{ color: "#495057", marginBottom: "1rem" }}>Specializations</h3>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {(user.interests || []).slice(0, 8).map((spec, index) => (
                          <span key={index} style={{ padding: "0.5rem 1rem", background: "#e3f2fd", color: "#1976d2", borderRadius: "20px", fontSize: "0.9rem", fontWeight: "500" }}>{spec}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 style={{ color: "#495057", marginBottom: "1rem" }}>Recent Achievements</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span>🏆</span>
                          <span>{user.achievements || "No achievements added yet."}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span>⭐</span>
                          <span>{(user.rating || 0) > 0 ? `${user.rating} rating` : "No ratings yet"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              <h2 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>Technical Skills</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
                {(user.skills || []).map((skill, index) => (
                  <div key={index} style={{ padding: "1.5rem", background: "#f8f9fa", borderRadius: "12px", border: "1px solid #e9ecef" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <h3 style={{ margin: 0, color: "#333", fontWeight: "600" }}>{skill}</h3>
                    </div>
                  </div>
                ))}
                {((user.skills || []).length === 0) && <div>No skills listed.</div>}
              </div>
            </div>
          )}

          {(activeTab === "followers" || activeTab === "following") && (
            <div>
              <h2 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>{user.role === "mentor" ? "Followers" : "Following"} ({followersData.length})</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1rem" }}>
                {followersData.map((follower) => <FollowerCard key={follower.id} follower={follower} />)}
              </div>
            </div>
          )}




        </div>
        {/* fetch  sent request */}
        <div style={{ marginTop: "2rem" }}>
          <h3>📩 Mentorship Requests</h3>

          {user.role?.toLowerCase() === "mentor" ? (
            <>
              <h4>Incoming Requests</h4>
              {incomingRequests.length > 0 ? (
                incomingRequests.map((r) => (
                  <div
                    key={r._id || r.id}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>{r.menteeId?.name || "Unknown mentee"}</strong> —{" "}
                      {r.menteeId?.email}
                    </div>
                    <div>
                      <button
                        onClick={() => handleAccept(r._id)}
                        style={{
                          background: "#27ae60",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          marginRight: "6px",
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(r._id)}
                        style={{
                          background: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No incoming requests yet.</p>
              )}
            </>
          ) : (
            <>
              <h4>Sent Requests</h4>
              {outgoingRequests.length > 0 ? (
                outgoingRequests.map((r) => (
                  <div
                    key={r._id || r.id}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Sent to <strong>{r.mentorId?.name || "Unknown mentor"}</strong> —{" "}
                    {r.status}
                  </div>
                ))
              ) : (
                <p>No sent requests yet.</p>
              )}
            </>
          )}
        </div>

      </main >
    </div >
  );
}
