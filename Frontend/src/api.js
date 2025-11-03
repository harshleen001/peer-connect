const API_BASE = import.meta.env.VITE_API_BASE_URL;

// src/api.js

export const api = async (endpoint, method = "GET", data = null) => {
  const token = localStorage.getItem("token");

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${API_BASE}${endpoint}`, options);

  if (!res.ok) {
    const msg = await res.text();
    console.error("API error:", res.status, msg);
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
};


// src/api.js

// ----------------- Mentorship Requests API -----------------
export const requestAPI = {
  send: (mentorId) => api(`/requests/${mentorId}`, "POST"),
  getIncoming: () => api(`/requests/incoming`, "GET"),
  getSent: () => api(`/requests/sent`, "GET"),
  cancel: (requestId) => api(`/requests/${requestId}`, "DELETE"),
  connections: (token) => api(`/connections`, "GET", null, token), // ✅ NEW
  removeConnection: (id, token) => api(`/connections/${id}`, "DELETE", null, token),
};



// ----------------- Mentorship Requests API -----------------

// export const requestAPI = {
//   // mentee sends request to mentor
//   send: (mentorId, token) =>
//     api(`/requests`, "POST", { mentorId }, token),

//   // mentor fetches incoming requests
//   getIncoming: (token) =>
//     api(`/requests/incoming`, "GET", null, token),

//   // mentee fetches outgoing (sent) requests
//   getOutgoing: (token) =>
//     api(`/requests/outgoing`, "GET", null, token),

//   // mentor accepts / rejects
//   accept: (requestId, token) =>
//     api(`/requests/${requestId}/accept`, "POST", null, token),

//   reject: (requestId, token) =>
//     api(`/requests/${requestId}/reject`, "POST", null, token),
// };
