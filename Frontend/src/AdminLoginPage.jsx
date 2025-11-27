import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "./api";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await adminAPI.login({ email, password });
      localStorage.setItem("token", res.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("role", (res.user.role || "").toLowerCase());
      window.dispatchEvent(new Event("auth-updated"));
      navigate("/admin");
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #667eea, #764ba2)", padding: "20px" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "16px", width: "100%", maxWidth: "420px" }}>
        <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>P</div>
          <div style={{ fontSize: "18px", fontWeight: 700 }}>Peer Connect</div>
        </div>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>Admin Login</h1>
        <p style={{ marginTop: "6px", color: "#64748b" }}>Sign in with admin credentials</p>
        {error && <div style={{ color: "#ef4444", marginTop: "10px" }}>{error}</div>}
        <form onSubmit={submit} style={{ marginTop: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px" }} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "12px", border: "2px solid #e5e7eb", borderRadius: "10px" }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", border: "none", borderRadius: "12px", background: "#667eea", color: "white", fontWeight: 600 }}>
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>
        <button type="button" onClick={() => navigate("/login")} style={{ width: "100%", padding: "14px", border: "2px solid #667eea", borderRadius: "12px", background: "white", color: "#667eea", fontWeight: 600, marginTop: "12px" }}>
          Back to User Login
        </button>
      </div>
    </div>
  );
}