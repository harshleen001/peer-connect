// src/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "./api";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [ok, setOk] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        setOk(false);
        return;
      }

      try {
        // Optional: Validate token by hitting your user info route
        await api("/user/me", "GET", null, token);
        setUserRole(user.role);

        // Check if the user's role is allowed for this route
        if (allowedRoles && !allowedRoles.includes(user.role)) {
          setOk(false);
        } else {
          setOk(true);
        }
      } catch (err) {
        console.error("Auth validation failed:", err);
        setOk(false);
      }
    };

    verifyUser();
  }, [allowedRoles]);

  if (ok === null)
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "20%",
          fontSize: "18px",
          color: "#64748b",
        }}
      >
        🔒 Verifying your session...
      </div>
    );

  if (!ok) return <Navigate to="/login" replace />;

  return children;
}
