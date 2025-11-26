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
import PostDetailPage from "./PostDetailPage.jsx";
import UserProfilePage from "./UserProfilePage.jsx";
import AdminManagementPage from "./AdminManagementPage.jsx";
import AdminLoginPage from "./AdminLoginPage.jsx";
import StudentRegistrationPage from "./StudentRegistrationPage.jsx"; // ✅ ADDED
import Dashboard from "./Dashboard.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import MenteeDashboard from "./MenteeDashboard.jsx";
import MentorDashboard from "./MentorDashboard.jsx";
import { notificationsAPI } from "./api";
import RecommendedMentorsPage from "./RecommendedMentorsPage.jsx";
import HelpPage from "./HelpPage.jsx";
import SettingsPage from "./SettingsPage.jsx";
import ReportHistoryPage from "./ReportHistoryPage.jsx";


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
  const [pendingCount, setPendingCount] = useState(0);
  const [authVersion, setAuthVersion] = useState(0);

  // React to auth updates (login/logout) to re-render dashboard selection immediately
  useEffect(() => {
    const bump = () => setAuthVersion((v) => v + 1);
    window.addEventListener("auth-updated", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("auth-updated", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  useEffect(() => {
    const refreshPending = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setPendingCount(0);
        return;
      }
      try {
        const res = await notificationsAPI.list({ page: 1, limit: 1, isRead: false });
        setPendingCount(res.totalNotifications || 0);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    refreshPending();
    window.addEventListener("notifications-updated", refreshPending);
    return () => {
      window.removeEventListener("notifications-updated", refreshPending);
    };
  }, [authVersion]);

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
                  {(() => {
                    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
                    const role = (localStorage.getItem("role") || storedUser?.role || "").trim().toLowerCase();
                    return role === "mentor";
                  })() ? (
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
            path="/community-chats/:communityId/posts/:postId"
            element={
              <PageLayout notificationCount={pendingCount}>
                <PostDetailPage />
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
                <NotificationsPage />
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
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <PageLayout notificationCount={pendingCount}>
                  <UserProfilePage />
                </PageLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <PageLayout notificationCount={pendingCount}>
                <LeaderboardPage />
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
          <Route
            path="/mentors/recommended"
            element={
              <ProtectedRoute>
                <PageLayout notificationCount={pendingCount}>
                  <RecommendedMentorsPage />
                </PageLayout>
              </ProtectedRoute>
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

          <Route path="/admin-login" element={<AdminLoginPage />} />

          {/* ✅ ADDED - Student Registration Route */}
          <Route
            path="/register"
            element={<StudentRegistrationPage />}
          />

          {/* Info Pages */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <PageLayout notificationCount={pendingCount}>
                  <SettingsPage />
                </PageLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/report-history"
            element={
              <ProtectedRoute>
                <PageLayout notificationCount={pendingCount}>
                  <ReportHistoryPage />
                </PageLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <PageLayout notificationCount={pendingCount}>
                <HelpPage />
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
      </div>
    </Router>
  );
}

export default App;