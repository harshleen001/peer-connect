import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header({ notificationCount = 3 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const menuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Check login and admin status
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
    window.addEventListener("auth-updated", checkStatus);

    return () => {
      window.removeEventListener("storage", checkStatus);
      window.removeEventListener("auth-updated", checkStatus);
      clearInterval(interval);
    };
  }, []);

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleAdminAccess = () => {
    setShowMoreMenu(false);
    if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/admin-login");
    }
  };

  const handleLogout = () => {
    setShowMoreMenu(false);
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("userName");
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setIsAdmin(false);
      alert("Logged out successfully! 👋");
      // notify auth change
      window.dispatchEvent(new Event("auth-updated"));
      navigate("/login");
    }
  };

  const handleMoreOptionClick = (option) => {
    setShowMoreMenu(false);
    switch (option) {
      case "settings":
        navigate("/settings");
        break;
      case "report-history":
        navigate("/report-history");
        break;
      case "help":
        navigate("/help");
        break;
      case "feedback":
        navigate("/feedback");
        break;
      case "login":
        navigate("/login");
        break;
      default:
        break;
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showMoreMenu]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [showMoreMenu]);

  return (
    <header
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "1rem 2rem",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "white",
            cursor: "pointer",
          }}
          onClick={() => handleNavClick("/")}
        >
          <span
            style={{
              width: "40px",
              height: "40px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
          >
            M
          </span>
          <span
            style={{
              fontWeight: "bold",
              fontSize: "1.2rem",
              letterSpacing: "1px",
            }}
          >
            MENTORSHIP PLATFORM
          </span>
        </div>

        {/* Navigation */}
        <nav
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          {(
            [
              ...(isAdmin ? [] : [{ path: "/", label: "Dashboard" }]),
              ...(isAdmin ? [] : [{ path: "/messages", label: "Messages" }]),
              { path: "/leaderboard", label: "🏆 Leaderboard" },
              { path: "/notifications", label: "🔔 Notifications" },
              { path: "/profile", label: "Profile" },
              ...(isAdmin ? [{ path: "/admin", label: "🛡️ Admin Panel" }] : []),
            ]
          ).map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              style={{
                padding: "0.75rem 1.25rem",
                background: isActive(item.path)
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.1)",
                color: isActive(item.path) ? "#667eea" : "white",
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
                fontWeight: isActive(item.path) ? "600" : "500",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
              }}
            >
                {item.label}
                {item.path === "/notifications" && notificationCount > 0 && (
                  <span
                    style={{
                      background: "#ff4757",
                      color: "white",
                    borderRadius: "50%",
                    width: "22px",
                    height: "22px",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "4px",
                    fontWeight: "bold",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  }}
                >
                  {notificationCount}
                </span>
              )}
            </button>
          ))}

          {/* More Options */}
          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{
                padding: "0.75rem",
                background: showMoreMenu
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.1)",
                color: showMoreMenu ? "#667eea" : "white",
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                width: "45px",
                height: "45px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                  width: "18px",
                }}
              >
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "100%",
                      height: "2px",
                      backgroundColor: "currentColor",
                      borderRadius: "1px",
                    }}
                  ></div>
                ))}
              </div>
            </button>

            {showMoreMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: "0",
                  marginTop: "0.5rem",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  padding: "0.5rem 0",
                  minWidth: "200px",
                  zIndex: 1000,
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              >
                {[
                  ...(isLoggedIn
                    ? [
                        { label: "⚙️ Settings", action: "settings" },
                        { label: "📊 Report History", action: "report-history" },
                      ]
                    : []),
                  { label: "❓ Help", action: "help" },
                  { label: "💬 Send Feedback", action: "feedback" },
                  ...(!isLoggedIn ? [{ label: "🔐 Login", action: "login" }] : []),
                ].map((opt) => (
                  <button
                    key={opt.action}
                    onClick={() => handleMoreOptionClick(opt.action)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      color: "#333",
                      fontSize: "0.95rem",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#f8f9fa")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    {opt.label}
                  </button>
                ))}
                
                {!isAdmin && isLoggedIn && (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      navigate("/admin-login");
                    }}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      color: "#667eea",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#f8f9fa")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    <span>🔐</span>
                    Admin Login
                  </button>
                )}

                {/* Logout */}
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      color: "#ff4757",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#fee2e2")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    <span>🚪</span> Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}