import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    year: "",
    branch: "",
    phone: "",
    address: "",
    bio: "",
    skills: [],
    interests: [],
    achievements: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api("/user/me", "GET");
      setUser(response);
      setFormData({
        name: response.name || "",
        email: response.email || "",
        year: response.year || "",
        branch: response.branch || "",
        phone: response.phone || "",
        address: response.address || "",
        bio: response.bio || "",
        skills: response.skills || [],
        interests: response.interests || [],
        achievements: response.achievements || "",
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
      setMessage({ type: "error", text: "Failed to load user data" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value.split(",").map((item) => item.trim()).filter(Boolean),
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api("/user/me", "PATCH", formData);
      setUser(response);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      // Update localStorage
      localStorage.setItem("userName", response.name);
      localStorage.setItem("user", JSON.stringify(response));
      window.dispatchEvent(new Event("auth-updated"));
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await api("/user/change-password", "PATCH", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Error changing password:", err);
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to change password",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type === "profile" ? "profilePicture" : "resume", file);

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = type === "profile" ? "/user/upload/profile-picture" : "/user/upload/resume";
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed");

      setUser(data.user);
      setMessage({ type: "success", text: `${type === "profile" ? "Profile picture" : "Resume"} uploaded successfully!` });
      window.dispatchEvent(new Event("auth-updated"));
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Upload failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
        <p>Loading settings...</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem", color: "#2c3e50" }}>
        ⚙️ Settings
      </h1>

      {message.text && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            borderRadius: "8px",
            background: message.type === "success" ? "#d1fae5" : "#fee2e2",
            color: message.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${message.type === "success" ? "#10b981" : "#ef4444"}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "2px solid #e2e8f0" }}>
        {[
          { id: "profile", label: "📝 Profile", icon: "📝" },
          { id: "password", label: "🔒 Password", icon: "🔒" },
          { id: "preferences", label: "🎨 Preferences", icon: "🎨" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === tab.id ? "#667eea" : "transparent",
              color: activeTab === tab.id ? "white" : "#64748b",
              border: "none",
              borderBottom: activeTab === tab.id ? "3px solid #667eea" : "3px solid transparent",
              cursor: "pointer",
              fontWeight: activeTab === tab.id ? "600" : "500",
              fontSize: "1rem",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>Profile Information</h2>

          {/* Profile Picture */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Profile Picture</label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: user?.profilePicture
                    ? `url(${import.meta.env.VITE_API_BASE_URL}${user.profilePicture}) center/cover no-repeat`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "2rem",
                }}
              >
                {!user?.profilePicture && (user?.name?.[0] || "U")}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "profile")}
                  style={{ display: "none" }}
                  id="profile-picture-upload"
                />
                <label
                  htmlFor="profile-picture-upload"
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                >
                  Change Picture
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  background: "#f3f4f6",
                  color: "#6b7280",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Branch</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="4"
              placeholder="Tell us about yourself..."
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              {user?.role === "mentor" ? "Skills" : "Interests"} (comma-separated)
            </label>
            <input
              type="text"
              value={user?.role === "mentor" ? formData.skills.join(", ") : formData.interests.join(", ")}
              onChange={(e) =>
                handleArrayInputChange(user?.role === "mentor" ? "skills" : "interests", e.target.value)
              }
              placeholder="e.g., JavaScript, React, Node.js"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
            />
          </div>

          {user?.role === "mentor" && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Achievements</label>
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleInputChange}
                rows="3"
                placeholder="List your achievements..."
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  resize: "vertical",
                }}
              />
            </div>
          )}

          {/* Resume Upload (for mentors) */}
          {user?.role === "mentor" && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Resume</label>
              {user?.resumeLink && (
                <a
                  href={`${import.meta.env.VITE_API_BASE_URL}${user.resumeLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginBottom: "0.5rem",
                    color: "#667eea",
                    textDecoration: "none",
                  }}
                >
                  View Current Resume
                </a>
              )}
              <div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, "resume")}
                  style={{ display: "none" }}
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                >
                  {user?.resumeLink ? "Update Resume" : "Upload Resume"}
                </label>
              </div>
            </div>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            style={{
              padding: "0.75rem 2rem",
              background: saving ? "#94a3b8" : "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>Change Password</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "500px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Current Password *</label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>New Password *</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Confirm New Password *</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
                required
              />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={saving}
              style={{
                padding: "0.75rem 2rem",
                background: saving ? "#94a3b8" : "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
                alignSelf: "flex-start",
              }}
            >
              {saving ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem" }}>Preferences</h2>
          <div style={{ color: "#64748b", marginBottom: "1rem" }}>
            <p>Notification preferences and other settings will be available soon.</p>
            <p>For now, you can manage your notifications from the Notifications page.</p>
          </div>
        </div>
      )}
    </main>
  );
}
