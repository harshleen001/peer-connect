import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api"; // ✅ Import api.js wrapper

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // 🔹 Redirect to login if no token on load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.clear();
      navigate("/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [navigate]);

  // 🔹 Handle login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api("/auth/login", "POST", { email, password });

      alert(`✅ Welcome back, ${res.user.name}!`);

      // Save token and login status
      localStorage.setItem("token", res.token);
      localStorage.setItem("isLoggedIn", "true");

      // Fetch authoritative user info (ensures up-to-date role)
      const me = await api("/user/me", "GET", null, res.token);

      localStorage.setItem("user", JSON.stringify(me || res.user));
      const role = ((me?.role ?? res.user.role) || "").trim().toLowerCase();
      localStorage.setItem("role", role);
      localStorage.setItem("isAdmin", role === "admin" ? "true" : "false");

      // Notify app to re-render dashboard decision immediately
      window.dispatchEvent(new Event("auth-updated"));

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      alert("❌ Login failed: " + err.message);
    }
  };

  // 🔹 Handle logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      setIsLoggedIn(false);
      localStorage.clear(); // ✅ Removes token, userType, user info, etc.
      alert("Logged out successfully! 👋");
      navigate("/login");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "48px 40px",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 8px 25px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: "28px",
              fontWeight: "700",
              color: "#1a202c",
              letterSpacing: "-0.5px",
            }}
          >
            Welcome Back! 🚀
          </h1>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "16px",
              fontWeight: "400",
            }}
          >
            Sign in to continue to your account
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div
          style={{
            background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
            border: "1px solid #0ea5e9",
            padding: "16px",
            borderRadius: "16px",
            marginBottom: "32px",
            fontSize: "14px",
            color: "#0369a1",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, #0ea5e9, #06b6d4, #0ea5e9)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "16px" }}>📝</span>
            <strong style={{ fontSize: "15px", fontWeight: "600" }}>Demo Credentials</strong>
          </div>
          <div
            style={{
              fontSize: "13px",
              lineHeight: "1.5",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <div>
              <strong>Email:</strong> test@test.com
            </div>
            <div>
              <strong>Password:</strong> 1234
            </div>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#0369a1",
              marginTop: "4px",
              opacity: 0.8,
            }}
          >
            (or enter any email/password)
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
          {/* Email Field */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: "600",
                display: "block",
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "2px solid #e5e7eb",
                outline: "none",
                fontSize: "15px",
                backgroundColor: "#fafafa",
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: "32px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: "600",
                display: "block",
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "2px solid #e5e7eb",
                outline: "none",
                fontSize: "15px",
                backgroundColor: "#fafafa",
              }}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "16px",
              border: "none",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: "600",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Login
          </button>

          {/* Register Button */}
          <button
            type="button"
            onClick={() => navigate("/register")}
            style={{
              width: "100%",
              padding: "16px",
              border: "2px solid #667eea",
              borderRadius: "12px",
              background: "white",
              color: "#667eea",
              fontWeight: "600",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "12px",
            }}
          >
            🎓 Register as Student
          </button>

          {/* Links */}
          <div
            style={{
              marginTop: "24px",
              fontSize: "14px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <a
              href="#"
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Forgot Password?
            </a>
            <span style={{ margin: "0 12px", color: "#cbd5e0" }}>|</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Create Account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
