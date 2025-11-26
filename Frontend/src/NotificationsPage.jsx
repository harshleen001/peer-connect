// NotificationsPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import { notificationsAPI, requestsAPI } from "./api";

function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({ notifications: [], totalNotifications: 0 });

  const load = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);
    setError("");
    try {
      const res = await notificationsAPI.list({ page, limit, type: filter === "all" ? undefined : filter });
      setData({ notifications: res.notifications || [], totalNotifications: res.totalNotifications || 0 });
    } catch (e) {
      setError("Failed to load notifications");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(currentPage, itemsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, itemsPerPage, currentPage]);

  const filteredNotifications = useMemo(() => {
    const list = data.notifications || [];
    return list.filter((n) => (n.message || "").toLowerCase().includes(searchQuery.toLowerCase()));
  }, [data.notifications, searchQuery]);

  const totalPages = Math.ceil((filteredNotifications.length || 0) / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = filteredNotifications.slice(startIndex, endIndex);

  const getTypeBadge = (type) => {
    const map = { request: "#6366f1", chat: "#06b6d4", community: "#10b981", xp: "#f59e0b", info: "#64748b" };
    return map[type] || "#64748b";
  };

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setData((prev) => ({ ...prev, notifications: prev.notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)) }));
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (e) {
      console.error(e);
      alert("Failed to mark as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setData((prev) => ({ ...prev, notifications: prev.notifications.filter((n) => n._id !== id) }));
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (e) {
      console.error(e);
      alert("Failed to delete notification");
    }
  };

  const clearAll = async () => {
    if (!window.confirm("Clear all notifications?")) return;
    try {
      await notificationsAPI.clearAll();
      setData({ notifications: [], totalNotifications: 0 });
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (e) {
      console.error(e);
      alert("Failed to clear notifications");
    }
  };

  const handleRequestAction = async (requestId, action, notifId) => {
    try {
      await requestsAPI.updateStatus(requestId, action);
      await markRead(notifId);
      await deleteNotification(notifId);
      window.dispatchEvent(new Event("notifications-updated"));
      alert(`Request ${action}`);
    } catch (e) {
      console.error(e);
      alert(`Failed to ${action} request`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#2c3e50", margin: 0 }}>Notifications</h1>
        <div>
          <button onClick={() => load(currentPage, itemsPerPage)} style={{ padding: "0.6rem 1rem", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, marginRight: 8, cursor: "pointer" }}>Refresh</button>
          <button onClick={clearAll} style={{ padding: "0.6rem 1rem", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>Clear All</button>
        </div>
      </div>

      <div style={{ display: "flex", background: "#f8f9fa", borderRadius: "12px", padding: "0.5rem", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {["all", "request", "chat", "community", "rating", "xp", "info"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilter(status);
              setCurrentPage(1);
            }}
            style={{
              padding: "0.75rem 1.5rem",
              background: filter === status ? "#667eea" : "transparent",
              color: filter === status ? "white" : "#6c757d",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              textTransform: "capitalize",
              transition: "all 0.3s ease",
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: "1", minWidth: "250px" }}>
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "0.75rem 1rem", border: "2px solid #e9ecef", borderRadius: "8px", fontSize: "0.95rem", outline: "none" }}
          />
        </div>
        <div style={{ minWidth: "150px" }}>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ width: "100%", padding: "0.75rem 1rem", border: "2px solid #e9ecef", borderRadius: "8px", fontSize: "0.95rem", cursor: "pointer", outline: "none", background: "white" }}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "1rem", color: "#6c757d", fontSize: "0.9rem" }}>
        {loading ? "Loading..." : error ? error : `Showing ${currentNotifications.length > 0 ? startIndex + 1 : 0} - ${Math.min(endIndex, filteredNotifications.length)} of ${filteredNotifications.length} results`}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
        {currentNotifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6c757d", fontSize: "1.1rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>🔔</div>
            <p>No notifications</p>
          </div>
        ) : (
          currentNotifications.map((n) => (
            <div key={n._id} style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e9ecef" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                  <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>🔔</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "#2c3e50" }}>
                        {n.message}
                      </h3>
                      <span style={{ padding: "2px 8px", background: `${getTypeBadge(n.type)}20`, color: getTypeBadge(n.type), borderRadius: 12, fontSize: 12 }}>{n.type}</span>
                    </div>
                    <div style={{ marginTop: 4, color: "#64748b", fontSize: 12 }}>{(n.createdAt || n.timestamp) ? new Date(n.createdAt || n.timestamp).toLocaleString() : ""}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {!n.isRead && n.type !== "request" && (
                    <button onClick={() => markRead(n._id)} style={{ padding: "0.4rem 0.8rem", background: "#e5f3ff", color: "#1e88e5", border: "1px solid #bbdefb", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem" }}>Mark read</button>
                  )}
                  <button onClick={() => deleteNotification(n._id)} style={{ padding: "0.4rem 0.8rem", background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem" }}>✕</button>
                </div>
              </div>
              {n.link && (
                <div style={{ marginTop: 8 }}>
                  <a href={n.link} style={{ color: "#667eea", textDecoration: "none", fontSize: "0.9rem" }}>Open →</a>
                </div>
              )}

              {n.type === "request" && n.data?.requestId && (
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: 16 }}>
                  <button onClick={() => handleRequestAction(n.data.requestId, "rejected", n._id)} style={{ padding: "0.6rem 1.2rem", background: "#e74c3c", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "600", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 44 }}>❌</button>
                  <button onClick={() => handleRequestAction(n.data.requestId, "accepted", n._id)} style={{ padding: "0.6rem 1.2rem", background: "#27ae60", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "600", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 44 }}>✅</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ padding: "0.5rem 1rem", background: currentPage === 1 ? "#e9ecef" : "#667eea", color: currentPage === 1 ? "#6c757d" : "white", border: "none", borderRadius: 8, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}>← Previous</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => handlePageChange(i + 1)} style={{ padding: "0.5rem 1rem", background: currentPage === i + 1 ? "#667eea" : "white", color: currentPage === i + 1 ? "white" : "#495057", border: "2px solid", borderColor: currentPage === i + 1 ? "#667eea" : "#e9ecef", borderRadius: 8, cursor: "pointer" }}>{i + 1}</button>
          ))}
          <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} style={{ padding: "0.5rem 1rem", background: currentPage === totalPages ? "#e9ecef" : "#667eea", color: currentPage === totalPages ? "#6c757d" : "white", border: "none", borderRadius: 8, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}>Next →</button>
        </div>
      )}
    </main>
  );
}

export default NotificationsPage;