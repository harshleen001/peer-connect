import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "./api";

// Initial mock data
const initialUsers = [];

const initialActivities = [
  { id: 1, user: "Rohit Sharma", action: "Sent message to mentor", timestamp: new Date().toISOString(), type: "message" },
  { id: 2, user: "Priya Patel", action: "Joined #react-dev chat", timestamp: new Date(Date.now() - 300000).toISOString(), type: "chat" },
  { id: 3, user: "Harshleen Kaur", action: "Updated profile", timestamp: new Date(Date.now() - 600000).toISOString(), type: "profile" },
  { id: 4, user: "Manraj Singh", action: "Accepted mentorship request", timestamp: new Date(Date.now() - 900000).toISOString(), type: "mentorship" },
];

function AdminManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState(initialUsers);
  const [activities, setActivities] = useState(initialActivities);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [stats, setStats] = useState({ totalUsers: 0, totalMentors: 0, totalMentees: 0, totalReviews: 0, totalChats: 0 });
  const [feedbacks, setFeedbacks] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Student",
    status: "Active",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [u, s, r] = await Promise.all([
          adminAPI.users(),
          adminAPI.stats(),
          adminAPI.reviews(),
        ]);
        setUsers(u);
        setStats(s);
        setFeedbacks(r.reviews || []);
      } catch (err) {
        console.error("Failed to load admin data", err);
      }
    };
    load();
  }, []);

  const handleOpenModal = (type, user = null) => {
    setModalType(type);
    setCurrentUser(user);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "Student",
        status: "Active",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentUser(null);
    setFormData({ name: "", email: "", role: "Student", status: "Active" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalType === "add") {
      const newUser = {
        id: Date.now(),
        ...formData,
        joinDate: new Date().toISOString().split("T")[0],
      };
      setUsers([...users, newUser]);
      alert("✅ User added successfully!");
    } else {
      setUsers(users.map((u) => (u.id === currentUser.id ? { ...u, ...formData } : u)));
      alert("✅ User updated successfully!");
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminAPI.deleteUser(id);
      const updated = await adminAPI.users();
      setUsers(updated);
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getActivityIcon = (type) => {
    const icons = {
      message: "💬",
      chat: "👥",
      profile: "👤",
      mentorship: "🤝",
      view: "👁️",
      session: "📚",
    };
    return icons[type] || "📌";
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || (user.role || "") === filterRole;
    return matchesSearch && matchesRole;
  });

  const derived = {
    totalUsers: stats.totalUsers,
    activeUsers: users.length,
    mentors: stats.totalMentors,
    students: stats.totalMentees,
  };

  return (
    <div style={{ padding: "80px 20px 20px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
          🛡️ Admin Management
        </h1>
        <p style={{ color: "#64748b", fontSize: "16px" }}>
          Monitor activities, manage users, and oversee the platform
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "2px solid #e2e8f0" }}>
        {["dashboard", "users", "feedbacks", "activities"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 24px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              color: activeTab === tab ? "#667eea" : "#64748b",
              borderBottom: activeTab === tab ? "3px solid #667eea" : "3px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "32px" }}>
            {[
              { label: "Total Users", value: derived.totalUsers, icon: "👥", color: "#667eea" },
              { label: "Active Users", value: derived.activeUsers, icon: "✅", color: "#10b981" },
              { label: "Mentors", value: derived.mentors, icon: "🎓", color: "#f59e0b" },
              { label: "Students", value: derived.students, icon: "📚", color: "#ec4899" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "white",
                  padding: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>{stat.icon}</div>
                <div style={{ fontSize: "28px", fontWeight: "700", color: stat.color, marginBottom: "4px" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "14px", color: "#64748b" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Activities Preview */}
          <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
              📊 Recent Activities
            </h2>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {activities.slice(0, 10).map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>{getActivityIcon(activity.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>{activity.user}</div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>{activity.action}</div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {getTimeAgo(activity.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="🔍 Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: "1",
                minWidth: "200px",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <option>All</option>
              <option>Student</option>
              <option>Mentor</option>
              <option>Admin</option>
            </select>
            <button
              onClick={() => handleOpenModal("add")}
              style={{
                padding: "12px 24px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.background = "#5568d3")}
              onMouseOut={(e) => (e.target.style.background = "#667eea")}
            >
              ➕ Add User
            </button>
          </div>

          <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Name</th>
                  <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Email</th>
                  <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Role</th>
                  <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Join Date</th>
                  <th style={{ padding: "16px", textAlign: "center", fontWeight: "600" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px" }}>{user.name}</td>
                    <td style={{ padding: "16px", color: "#64748b" }}>{user.email}</td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: (user.role || "") === "mentor" ? "#fef3c7" : (user.role === "admin" ? "#fde68a" : "#dbeafe"),
                          color: (user.role || "") === "mentor" ? "#92400e" : (user.role === "admin" ? "#92400e" : "#1e40af"),
                        }}
                      >
                        {(user.role || "").charAt(0).toUpperCase() + (user.role || "").slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "16px", color: "#64748b" }}>{new Date(user.createdAt).toISOString().split("T")[0]}</td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <button
                        onClick={() => navigate(`/profile/${user._id}`)}
                        style={{
                          padding: "6px 12px",
                          background: "#667eea",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          marginRight: "8px",
                        }}
                      >
                        👁️ View Profile
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        style={{
                          padding: "6px 12px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "feedbacks" && (
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>Feedbacks</h2>
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {feedbacks.map((f) => (
              <div key={f._id} style={{ display: "flex", gap: "12px", padding: "12px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ fontWeight: 600 }}>{f.rating}★</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px" }}>{f.comment || "No comment"}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    From {(f.menteeId?.name || "")} to {(f.mentorId?.name || "")} on {new Date(f.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {feedbacks.length === 0 && <div style={{ color: "#64748b" }}>No feedbacks yet</div>}
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === "activities" && (
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700" }}>🔄 Real-Time Activity Monitor</h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#10b981",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  animation: "pulse 2s infinite",
                }}
              />
              Live
            </div>
          </div>
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {activities.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px",
                  borderBottom: "1px solid #f1f5f9",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: "32px" }}>{getActivityIcon(activity.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>
                    {activity.user}
                  </div>
                  <div style={{ fontSize: "14px", color: "#64748b" }}>{activity.action}</div>
                </div>
                <div style={{ fontSize: "13px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                  {getTimeAgo(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px" }}>
              {modalType === "add" ? "➕ Add New User" : "✏️ Edit User"}
            </h2>
            <div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option>Student</option>
                  <option>Mentor</option>
                  <option>Admin</option>
                </select>
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Suspended</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleSubmit}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {modalType === "add" ? "Add User" : "Update User"}
                </button>
                <button
                  onClick={handleCloseModal}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#e2e8f0",
                    color: "#64748b",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}

export default AdminManagementPage;