// App.jsx - Fixed to prevent duplicate headers
import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./Header.jsx";
import MessagesPage from "./MessagesPage.jsx";
import { mentors, chats, feed } from "./User.jsx";
import { MentorCard, ChatRow, FeedRow } from "./UserComponent.jsx";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import MentorPage from "./MentorPage.jsx";
import LoginPage from "./LoginPage.jsx";
import NotificationsPage from "./NotificationsPage.jsx";
import ProfilePage from "./ProfilePage.jsx";
import LeaderboardPage from "./LeaderboardPage.jsx";
import CommunityChatsPage from "./CommunityChatsPage.jsx";
import AdminManagementPage from "./AdminManagementPage.jsx";
import StudentRegistrationPage from "./StudentRegistrationPage.jsx"; // ✅ ADDED
import Dashboard from "./Dashboard.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import MenteeDashboard from "./MenteeDashboard.jsx";
import MentorDashboard from "./MentorDashboard.jsx";

// ----------------- Initial Notifications -----------------
const initialNotifications = [
  {
    id: 1,
    studentName: "Rohit Sharma",
    studentAvatar: "RS",
    subject: "React Development Mentoring",
    message: "Hi! I'm looking for guidance on React hooks and state management.",
    timestamp: "2 hours ago",
    status: "pending",
  },
  {
    id: 2,
    studentName: "Priya Patel",
    studentAvatar: "PP",
    subject: "Career Transition to Tech",
    message: "I'm transitioning from marketing to frontend development.",
    timestamp: "5 hours ago",
    status: "pending",
  },
  {
    id: 3,
    studentName: "Arjun Gupta",
    studentAvatar: "AG",
    subject: "Machine Learning Project Help",
    message: "Need help with feature engineering and model selection.",
    timestamp: "1 day ago",
    status: "pending",
  },
  {
    id: 4,
    studentName: "Sneha Reddy",
    studentAvatar: "SR",
    subject: "Backend Development Query",
    message: "Need help understanding microservices and API versioning.",
    timestamp: "2 days ago",
    status: "accepted",
  },
];

// ----------------- Global Logout Button -----------------
function LogoutButton() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn");
      setIsLoggedIn(loginStatus === "true");
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    const interval = setInterval(checkLoginStatus, 1000);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userType");
      localStorage.removeItem("userName");
      setIsLoggedIn(false);
      alert("Logged out successfully! 👋");
      navigate("/login");
    }
  };

  if (!isLoggedIn) return null;

  return (
    <button
      onClick={handleLogout}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#ff4757",
        color: "white",
        border: "none",
        borderRadius: "50px",
        padding: "12px 20px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(255, 71, 87, 0.3)",
        zIndex: 1000,
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = "#ff3742";
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow = "0 6px 16px rgba(255, 71, 87, 0.4)";
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = "#ff4757";
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "0 4px 12px rgba(255, 71, 87, 0.3)";
      }}
    >
      <span>🚪</span> Logout
    </button>
  );
}

// Admin Access Button (appears when logged in)
function AdminAccessButton() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const loginStatus = localStorage.getItem("isLoggedIn");
      const adminStatus = localStorage.getItem("isAdmin");
      setIsLoggedIn(loginStatus === "true");
      setIsAdmin(adminStatus === "true");
    };

    checkStatus();
    window.addEventListener("storage", checkStatus);
    const interval = setInterval(checkStatus, 1000);

    return () => {
      window.removeEventListener("storage", checkStatus);
      clearInterval(interval);
    };
  }, []);

  const handleAdminAccess = () => {
    if (isAdmin) {
      navigate("/admin");
    } else {
      const password = prompt("🔐 Enter Admin Password:");
      if (password === "admin123") {
        localStorage.setItem("isAdmin", "true");
        setIsAdmin(true);
        alert("✅ Admin access granted!");
        navigate("/admin");
      } else if (password !== null) {
        alert("❌ Invalid password!");
      }
    }
  };

  if (!isLoggedIn) return null;

  return (
    <button
      onClick={handleAdminAccess}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "140px",
        backgroundColor: isAdmin ? "#10b981" : "#667eea",
        color: "white",
        border: "none",
        borderRadius: "50px",
        padding: "12px 20px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: isAdmin ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "0 4px 12px rgba(102, 126, 234, 0.3)",
        zIndex: 1000,
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = isAdmin ? "#059669" : "#5568d3";
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow = isAdmin ? "0 6px 16px rgba(16, 185, 129, 0.4)" : "0 6px 16px rgba(102, 126, 234, 0.4)";
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = isAdmin ? "#10b981" : "#667eea";
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = isAdmin ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "0 4px 12px rgba(102, 126, 234, 0.3)";
      }}
    >
      <span>{isAdmin ? "🛡️" : "🔐"}</span> {isAdmin ? "Admin Panel" : "Admin Login"}
    </button>
  );
}

// Protected Route Component for Admin
function ProtectedAdminRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {
      alert("⚠️ Please login first!");
      navigate("/login");
    } else if (isAdmin !== "true") {
      alert("🚫 Access denied! Admin privileges required.");
      navigate("/");
    }
  }, [navigate]);

  return children;
}

// ----------------- Layout Wrapper -----------------
function PageLayout({ children, notificationCount }) {
  return (
    <>
      <Header notificationCount={notificationCount} />
      {children}
    </>
  );
}

// ----------------- Simple Info Pages -----------------
function SimplePage({ title, description }) {
  return (
    <main className="container">
      <h1>{title}</h1>
      <div className="panel">
        <p>{description}</p>
      </div>
    </main>
  );
}

// ----------------- Dashboard Content (WITHOUT Header) -----------------
function DashboardContent() {
  return (
    <main className="container">
      <h1>Dashboard</h1>

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

// ----------------- Main App -----------------
function App() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const pendingCount = notifications.filter((n) => n.status === "pending").length;

  const handleAccept = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "accepted" } : n))
    );
  };

  const handleReject = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "rejected" } : n))
    );
  };

  return (
    <Router>
      <div style={{ position: "relative", minHeight: "100vh" }}>
        <Routes>
          {/* Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PageLayout notificationCount={pendingCount}>
                  {localStorage.getItem("role") === "mentor" ? (
                    <MentorDashboard />
                  ) : (
                    <MenteeDashboard />
                  )}
                </PageLayout>
              </ProtectedRoute>
            }
          />


          {/* Communication */}
          <Route
            path="/messages"
            element={
              <PageLayout notificationCount={pendingCount}>
                <MessagesPage />
              </PageLayout>
            }
          />
          <Route
            path="/community-chats"
            element={
              <PageLayout notificationCount={pendingCount}>
                <CommunityChatsPage />
              </PageLayout>
            }
          />
          <Route
            path="/community-chats/:chatId"
            element={
              <PageLayout notificationCount={pendingCount}>
                <CommunityChatsPage />
              </PageLayout>
            }
          />

          {/* User Pages */}
          <Route
            path="/notifications"
            element={
              <PageLayout notificationCount={pendingCount}>
                <NotificationsPage
                  notifications={notifications}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              </PageLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PageLayout notificationCount={pendingCount}>
                  <ProfilePage />
                </PageLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <PageLayout notificationCount={pendingCount}>
                <LeaderboardPage mentors={mentors} />
              </PageLayout>
            }
          />

          {/* Mentor Pages */}
          <Route
            path="/mentor"
            element={
              <PageLayout notificationCount={pendingCount}>
                <MentorPage />
              </PageLayout>
            }
          />
          <Route
            path="/mentor/:id"
            element={
              <PageLayout notificationCount={pendingCount}>
                <MentorPage />
              </PageLayout>
            }
          />

          {/* Admin Route with Protection */}
          <Route
            path="/admin"
            element={
              <PageLayout notificationCount={pendingCount}>
                <ProtectedAdminRoute>
                  <AdminManagementPage />
                </ProtectedAdminRoute>
              </PageLayout>
            }
          />

          {/* ✅ ADDED - Student Registration Route */}
          <Route
            path="/register"
            element={<StudentRegistrationPage />}
          />

          {/* Info Pages */}
          <Route
            path="/settings"
            element={
              <PageLayout notificationCount={pendingCount}>
                <SimplePage
                  title="Settings"
                  description="Configure your account preferences here."
                />
              </PageLayout>
            }
          />
          <Route
            path="/report-history"
            element={
              <PageLayout notificationCount={pendingCount}>
                <SimplePage
                  title="Report History"
                  description="View your mentoring reports and history."
                />
              </PageLayout>
            }
          />
          <Route
            path="/help"
            element={
              <PageLayout notificationCount={pendingCount}>
                <SimplePage
                  title="Help & Support"
                  description="Find answers to common questions and get support."
                />
              </PageLayout>
            }
          />
          <Route
            path="/feedback"
            element={
              <PageLayout notificationCount={pendingCount}>
                <SimplePage
                  title="Send Feedback"
                  description="Share your thoughts to help us improve."
                />
              </PageLayout>
            }
          />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />
        </Routes>

        {/* Global Buttons */}
        <AdminAccessButton />
        <LogoutButton />
      </div>
    </Router>
  );
}

export default App;