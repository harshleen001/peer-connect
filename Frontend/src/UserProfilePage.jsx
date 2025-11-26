// UserProfilePage.jsx - View another user's profile
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileAPI, reviewsAPI, requestAPI, chatsAPI } from './api';

const ReviewModal = ({ isOpen, onClose, onSubmit, mentorId, existingReview }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
  }, [existingReview, isOpen]);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      alert('Please select a rating between 1 and 5');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ mentorId, rating, comment });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
          {existingReview ? 'Edit Review' : 'Rate & Review Mentor'}
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Rating (1-5 stars)
          </label>
          <div style={{ display: 'flex', gap: '8px', fontSize: '32px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: star <= rating ? '#FFD700' : '#E5E7EB',
                  fontSize: '32px',
                  lineHeight: 1
                }}
              >
                ★
              </button>
            ))}
          </div>
          <span style={{ fontSize: '14px', color: '#64748b', marginLeft: '8px' }}>
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
          </span>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Review Comment (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this mentor..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              minHeight: '100px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating < 1}
            style={{
              padding: '10px 20px',
              background: rating < 1 ? '#9ca3af' : '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: loading || rating < 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [connections, setConnections] = useState([]);
  const [showConnections, setShowConnections] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const role = (localStorage.getItem('role') || '').toLowerCase();
  const isOwnProfile = user?._id === id || user?.id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await profileAPI.get(id);
        setProfile(data);
        setReviews(data.reviews || []);
        
        // Check if current user has already reviewed this mentor
        if (role === 'mentee' && data.role === 'mentor' && user?._id) {
          const existing = (data.reviews || []).find(r => 
            String(r.menteeId?._id || r.menteeId) === String(user._id)
          );
          setExistingReview(existing || null);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProfile();
    }
  }, [id, role, user?._id]);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!profile || !user) return;
      try {
        const token = localStorage.getItem('token');
        const res = await requestAPI.connections(token);
        setConnections(res || []);
      } catch (err) {
        console.error('Error fetching connections:', err);
      }
    };
    if (showConnections || profile) {
      fetchConnections();
    }
  }, [showConnections, profile, user]);

  const handleSubmitReview = async ({ mentorId, rating, comment }) => {
    if (existingReview) {
      // Update existing review
      await reviewsAPI.update(existingReview._id, { rating, comment });
    } else {
      // Create new review
      await reviewsAPI.create({ mentorId, rating, comment });
    }
    // Reload profile to get updated data
    const data = await profileAPI.get(id);
    setProfile(data);
    setReviews(data.reviews || []);
    const existing = data.reviews?.find(r => 
      String(r.menteeId?._id || r.menteeId) === String(user._id)
    );
    setExistingReview(existing || null);
  };

  const getStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            style={{
              color: i < fullStars ? '#FFD700' : (i === fullStars && hasHalfStar) ? '#FFD700' : '#E5E7EB',
              fontSize: '20px'
            }}
          >
            ★
          </span>
        ))}
        <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#374151' }}>
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h3>Loading profile...</h3>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h3>{error || 'Profile not found'}</h3>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: '1rem',
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#f5f7fa", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif" }}>
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        {/* Profile Header */}
        <div style={{ background: "white", borderRadius: "20px", padding: "2rem", marginBottom: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e9ecef" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              marginBottom: '1rem',
              color: '#64748b'
            }}
          >
            ← Back
          </button>

          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
            {/* Avatar */}
            <div style={{
              width: "120px",
              height: "120px",
              background: profile.profilePicture
                ? `url(${import.meta.env.VITE_API_BASE_URL}${profile.profilePicture}) center/cover no-repeat`
                : "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "2.5rem",
              flexShrink: 0
            }}>
              {!profile.profilePicture && (profile.name ? profile.name.split(" ").map(n => n[0]).slice(0, 2).join("") : "U")}
            </div>

            {/* User Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "bold", color: "#2c3e50" }}>{profile.name}</h1>
                    {profile.role === 'mentor' && profile.verifiedMentor && (
                      <span style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    {profile.address && <span style={{ color: "#6c757d", fontSize: "1rem" }}>📍 {profile.address}</span>}
                    <span style={{ color: "#6c757d", fontSize: "1rem" }}>{profile.role === 'mentor' ? 'Mentor' : 'Mentee'}</span>
                    {profile.createdAt && <span style={{ color: "#6c757d", fontSize: "1rem" }}>📅 Joined {new Date(profile.createdAt).toLocaleDateString()}</span>}
                  </div>
                </div>

                {/* Action Buttons */}
                {role === 'mentee' && profile.role === 'mentor' && !isOwnProfile && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                      onClick={async () => {
                        try {
                          const chat = await chatsAPI.start(profile._id || id);
                          // Navigate to messages and preselect this chat
                          navigate('/messages', { state: { chatId: chat._id } });
                        } catch (err) {
                          console.error(err);
                          alert(err?.message || 'Unable to start chat. Ensure your request is accepted.');
                        }
                      }}
                      style={{
                        padding: "0.75rem 1.5rem",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "500"
                      }}
                    >
                      💬 Start Chat
                    </button>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      style={{
                        padding: "0.75rem 1.5rem",
                        background: "#667eea",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "500"
                      }}
                    >
                      {existingReview ? '✏️ Edit Review' : '⭐ Rate & Review'}
                    </button>
                  </div>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p style={{ color: "#495057", lineHeight: "1.6", fontSize: "1rem", margin: "1rem 0" }}>{profile.bio}</p>
              )}

              {/* Stats Section */}
              <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem" }}>
                {profile.role === "mentor" ? (
                  <>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea", cursor: "pointer" }}
                        onClick={() => {
                          setShowConnections(true);
                        }}
                      >
                        {profile.menteesHelped || 0}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Mentees</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>
                        {profile.rating ? profile.rating.toFixed(1) : '0.0'}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Rating</div>
                    </div>
                    {profile.reviewCount > 0 && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>
                          {profile.reviewCount}
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Reviews</div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>
                        {profile.year || 'N/A'}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Year</div>
                    </div>
                    {profile.branch && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>
                          {profile.branch}
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Branch</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Resume Link */}
              {profile.resumeLink && (
                <p style={{ marginTop: "1rem" }}>
                  📄 <a
                    href={`${import.meta.env.VITE_API_BASE_URL}${profile.resumeLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#667eea", textDecoration: "none" }}
                  >
                    View Resume
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Connections Modal */}
        {showConnections && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowConnections(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "2rem",
                width: "400px",
                maxHeight: "70vh",
                overflowY: "auto",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <h3>🤝 {profile.role === 'mentor' ? 'Mentees' : 'Mentors'}</h3>
              {connections.length === 0 ? (
                <p>No active connections yet.</p>
              ) : (
                connections.map((c) => {
                  const person = profile.role === "mentor" ? c.menteeId : c.mentorId;
                  if (!person) return null;

                  return (
                    <div
                      key={c._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: "1rem",
                        padding: "0.8rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{ display: "flex", alignItems: "center", cursor: "pointer", flex: 1 }}
                        onClick={() => navigate(`/profile/${person._id || person}`)}
                      >
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #667eea, #764ba2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          marginRight: "0.8rem"
                        }}>
                          {person.name ? person.name.split(" ").map(n => n[0]).slice(0, 2).join("") : "U"}
                        </div>
                        <div>
                          <div style={{ fontWeight: "bold" }}>{person.name || 'Unknown'}</div>
                          <div style={{ fontSize: "0.85rem", color: "#555" }}>{person.email || ''}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", background: "#f8f9fa", padding: "0.5rem", borderRadius: "12px" }}>
          {["overview", "skills", profile.role === "mentor" ? "reviews" : "following"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === tab ? "#667eea" : "transparent",
              color: activeTab === tab ? "white" : "#6c757d",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              textTransform: "capitalize",
              transition: "all 0.3s ease"
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ background: "white", borderRadius: "16px", padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e9ecef", minHeight: "400px" }}>
          {activeTab === "overview" && (
            <div>
              <h2 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>
                {profile.role === "mentor" ? "Mentoring Overview" : "Learning Journey"}
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
                {/* Specializations/Interests */}
                <div>
                  <h3 style={{ color: "#495057", marginBottom: "1rem" }}>Specializations</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {(profile.interests || []).length > 0 ? (
                      profile.interests.slice(0, 8).map((spec, index) => (
                        <span key={index} style={{ padding: "0.5rem 1rem", background: "#e3f2fd", color: "#1976d2", borderRadius: "20px", fontSize: "0.9rem", fontWeight: "500" }}>
                          {spec}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "#6c757d" }}>No specializations listed.</span>
                    )}
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <h3 style={{ color: "#495057", marginBottom: "1rem" }}>Recent Achievements</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>🏆</span>
                      <span>{profile.achievements || "No achievements added yet."}</span>
                    </div>
                    {profile.role === 'mentor' && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>⭐</span>
                        <span>{profile.rating ? `${profile.rating.toFixed(1)} rating` : "No ratings yet"}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Info */}
                {(profile.year || profile.branch) && (
                  <div>
                    <h3 style={{ color: "#495057", marginBottom: "1rem" }}>Academic Info</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {profile.year && (
                        <div style={{ color: "#6c757d" }}>Year: {profile.year}</div>
                      )}
                      {profile.branch && (
                        <div style={{ color: "#6c757d" }}>Branch: {profile.branch}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              <h2 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>Technical Skills</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
                {(profile.skills || []).length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <div key={index} style={{ padding: "1.5rem", background: "#f8f9fa", borderRadius: "12px", border: "1px solid #e9ecef" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{ margin: 0, color: "#333", fontWeight: "600" }}>{skill}</h3>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#6c757d" }}>No skills listed.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === "reviews" && profile.role === "mentor" && (
            <div>
              <h2 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>
                Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      style={{
                        padding: "1.5rem",
                        background: "#f8fafc",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                        <div>
                          <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                            {review.menteeId?.name || 'Anonymous'}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                            {new Date(review.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              style={{
                                color: i < review.rating ? "#FFD700" : "#E5E7EB",
                                fontSize: "18px"
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p style={{ margin: "0.5rem 0 0 0", color: "#374151", lineHeight: "1.6" }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#6c757d", textAlign: "center", padding: "2rem" }}>
                  No reviews yet. Be the first to review this mentor!
                </div>
              )}
            </div>
          )}

          {activeTab === "following" && profile.role === "mentee" && (
            <div>
              <h2 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>Following</h2>
              {connections.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1rem" }}>
                  {connections.map((c) => {
                    const mentor = c.mentorId;
                    if (!mentor) return null;
                    return (
                      <div
                        key={c._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1rem",
                          background: "#f8f9fa",
                          borderRadius: "12px",
                          border: "1px solid #e9ecef",
                          cursor: "pointer"
                        }}
                        onClick={() => navigate(`/profile/${mentor._id || mentor}`)}
                      >
                        <div style={{
                          width: "50px",
                          height: "50px",
                          background: "linear-gradient(135deg, #667eea, #764ba2)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "1rem"
                        }}>
                          {mentor.name ? mentor.name.split(" ").map(n => n[0]).slice(0, 2).join("") : "M"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>{mentor.name || 'Unknown'}</h4>
                          <p style={{ margin: "0.25rem 0 0 0", color: "#6c757d", fontSize: "0.9rem" }}>Mentor</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${mentor._id || mentor}`);
                          }}
                          style={{
                            padding: "0.5rem 1rem",
                            background: "#667eea",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.9rem"
                          }}
                        >
                          View Profile
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: "#6c757d", textAlign: "center", padding: "2rem" }}>
                  Not following any mentors yet.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        mentorId={id}
        existingReview={existingReview}
      />
    </div>
  );
};

export default UserProfilePage;
