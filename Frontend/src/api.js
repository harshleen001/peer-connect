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

// ----------------- Mentors / Recommendations API -----------------
export const mentorsAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api(`/mentors${qs ? `?${qs}` : ""}`, "GET");
  },
};

export const recommendationsAPI = {
  mine: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api(`/recommendations${qs ? `?${qs}` : ""}`, "GET");
  },
};

// ----------------- Reviews (Ratings) API -----------------
export const reviewsAPI = {
  create: ({ mentorId, rating, comment }) => api(`/reviews`, "POST", { mentorId, rating, comment }),
  forMentor: (mentorId) => api(`/reviews/${mentorId}`, "GET"),
  update: (id, payload) => api(`/reviews/${id}`, "PATCH", payload),
  remove: (id) => api(`/reviews/${id}`, "DELETE"),
};

// ----------------- Communities & Feed API -----------------
export const communitiesAPI = {
  list: () => api(`/community`, "GET"),
  mine: () => api(`/community/my`, "GET"),
  trending: () => api(`/community/trending`, "GET"),
  create: ({ name, description }) => api(`/community`, "POST", { name, description }),
  join: (id) => api(`/community/${id}/join`, "POST"),
  leave: (id) => api(`/community/${id}/leave`, "DELETE"),
  delete: (id) => api(`/community/${id}`, "DELETE"),
};

export const feedAPI = {
  my: () => api(`/community-post/feed/my`, "GET"),
};

// ----------------- Community Posts & Reactions API -----------------
export const communityPostsAPI = {
  list: (communityId) => api(`/community-post/${communityId}/posts`, "GET"),
  get: (communityId, postId) => api(`/community-post/${communityId}/posts/${postId}`, "GET"),
  create: (communityId, { content, mediaUrl }) => api(`/community-post/${communityId}/posts`, "POST", { content, mediaUrl }),
  delete: (communityId, postId) => api(`/community-post/${communityId}/posts/${postId}`, "DELETE"),
  upload: async (communityId, file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/community-post/${communityId}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  },
};

export const communityReactionsAPI = {
  react: (postId, reaction) => api(`/community-reaction/${postId}/react`, "POST", { reaction }),
};

// ----------------- Poll API -----------------
export const pollAPI = {
  create: (postId, { question, options }) => api(`/poll/${postId}/create`, "POST", { question, options }),
  vote: (postId, optionIndex) => api(`/poll/${postId}/vote`, "POST", { optionIndex }),
  revote: (postId, optionIndex) => api(`/poll/${postId}/vote`, "PATCH", { optionIndex }),
  get: (postId) => api(`/poll/${postId}`, "GET"),
  delete: (postId) => api(`/poll/${postId}`, "DELETE"),
};

// ----------------- Leaderboard API -----------------
export const leaderboardAPI = {
  list: () => api(`/leaderboard`, "GET"),
  getMentor: (mentorId) => api(`/leaderboard/${mentorId}`, "GET"),
};

// ----------------- Profile API -----------------
export const profileAPI = {
  get: (userId) => api(`/profile/${userId}`, "GET"),
};


// ----------------- Chats API -----------------
export const chatsAPI = {
  list: () => api(`/chats`, "GET"),
  start: (mentorId) => api(`/chats/start`, "POST", { mentorId }),
  getMessages: (chatId) => api(`/chats/${chatId}`, "GET"),
  sendMessage: (chatId, text) => api(`/chats/${chatId}/message`, "POST", { text }),
};

// ----------------- Notifications API -----------------
export const notificationsAPI = {
  list: ({ page = 1, limit = 10, type, isRead } = {}) => {
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("limit", String(limit));
    if (type) qs.set("type", type);
    if (typeof isRead === "boolean") qs.set("isRead", String(isRead));
    const suffix = qs.toString();
    return api(`/notifications${suffix ? `?${suffix}` : ""}`, "GET");
  },
  markRead: (id) => api(`/notifications/${id}/read`, "PATCH"),
  delete: (id) => api(`/notifications/${id}`, "DELETE"),
  clearAll: () => api(`/notifications/clear`, "DELETE"),
  unreadCommunityCount: () => api(`/notifications/community/unread`, "GET"),
  markCommunityRead: () => api(`/notifications/community/mark-read`, "PATCH"),
};

// ----------------- Requests API (for notification actions) -----------------
export const requestsAPI = {
  updateStatus: (requestId, status) => api(`/requests/${requestId}`, "PATCH", { status }),
};

export const adminAPI = {
  login: ({ email, password }) => api(`/auth/admin/login`, "POST", { email, password }),
  users: () => api(`/admin/users`, "GET"),
  deleteUser: (id) => api(`/admin/users/${id}`, "DELETE"),
  verifyMentor: (id) => api(`/admin/mentors/${id}/verify`, "PATCH"),
  stats: () => api(`/admin/stats`, "GET"),
  reviews: () => api(`/admin/reviews`, "GET"),
  communities: () => api(`/admin/communities`, "GET"),
  posts: () => api(`/admin/posts`, "GET"),
  requests: () => api(`/admin/requests`, "GET"),
  connections: () => api(`/admin/connections`, "GET"),
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
