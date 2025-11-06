// PostDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { communityPostsAPI, communityReactionsAPI } from './api';

const PostDetailPage = () => {
  const { communityId, postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const role = (localStorage.getItem('role') || '').toLowerCase();

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const data = await communityPostsAPI.get(communityId, postId);
        setPost(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load post:', err);
        setError('Failed to load post. It may not exist or you may not have access.');
      } finally {
        setLoading(false);
      }
    };

    if (communityId && postId) {
      loadPost();
    }
  }, [communityId, postId]);

  const handleReact = async (reaction) => {
    try {
      await communityReactionsAPI.react(postId, reaction);
      // Reload post to get updated reactions
      const updated = await communityPostsAPI.get(communityId, postId);
      setPost(updated);
    } catch (err) {
      console.error(err);
      alert('Failed to react');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await communityPostsAPI.delete(communityId, postId);
      alert('Post deleted successfully');
      navigate(`/community-chats/${communityId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to delete post');
    }
  };

  const isImage = (url) => {
    return url && url.match(/\.(png|jpe?g|gif|webp)$/i);
  };

  const isPdf = (url) => {
    return url && url.match(/\.pdf$/i);
  };

  // Helper to construct full URL for attachments
  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const cleanBase = baseUrl.replace(/\/$/, '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    // Avoid double /api if baseUrl already has /api
    if (cleanBase.endsWith('/api') && cleanUrl.startsWith('/api/')) {
      return `${cleanBase.replace(/\/api$/, '')}${cleanUrl}`;
    }
    return `${cleanBase}${cleanUrl}`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#64748b' }}>Loading post...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <h2 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>Post Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            {error || 'The post you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <button
            onClick={() => navigate(`/community-chats/${communityId}`)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            ← Back to Community
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => navigate(`/community-chats/${communityId}`)}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back
          </button>
          <Link
            to={`/community-chats/${communityId}`}
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            #{post.communityId?.name || 'Community'}
          </Link>
        </div>

        {/* Post Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}>
          {/* Post Header */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '20px',
              flexShrink: 0
            }}>
              <div
                onClick={() => {
                  if (post.mentorId?._id || post.mentorId) {
                    navigate(`/profile/${post.mentorId._id || post.mentorId}`);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                {(post.mentorId?.name || 'M').split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  <span
                    onClick={() => {
                      if (post.mentorId?._id || post.mentorId) {
                        navigate(`/profile/${post.mentorId._id || post.mentorId}`);
                      }
                    }}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {post.mentorId?.name || 'Mentor'}
                  </span>
                </h3>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: '#3b82f6',
                  color: 'white',
                  textTransform: 'uppercase'
                }}>
                  📝 Post
                </span>
              </div>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#64748b'
              }}>
                {new Date(post.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <div style={{
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: '18px',
              lineHeight: '1.7',
              color: '#374151',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {post.content}
            </div>

            {/* Media */}
            {post.mediaUrl && (
              <div style={{
                marginTop: '24px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
              }}>
                {isImage(post.mediaUrl) ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '16px',
                    background: '#f8fafc'
                  }}>
                    <img
                      src={getFullUrl(post.mediaUrl)}
                      alt="Post attachment"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '500px',
                        width: 'auto',
                        height: 'auto',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                ) : isPdf(post.mediaUrl) ? (
                  <div style={{
                    padding: '24px',
                    background: '#f8fafc',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                    <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>PDF Document</p>
                    <a
                      href={getFullUrl(post.mediaUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '10px 20px',
                        background: '#3b82f6',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '500'
                      }}
                    >
                      Open PDF in Browser
                    </a>
                  </div>
                ) : (
                  <div style={{
                    padding: '24px',
                    background: '#f8fafc',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📎</div>
                    <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>File Attachment</p>
                    <a
                      href={getFullUrl(post.mediaUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '10px 20px',
                        background: '#3b82f6',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '500'
                      }}
                    >
                      Open File
                    </a>
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af', wordBreak: 'break-all' }}>
                      {post.mediaUrl}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delete button for mentors */}
          {role === 'mentor' && String(post.mentorId?._id || post.mentorId) === String(user?._id) && (
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '24px',
              borderTop: '1px solid #f1f5f9',
              marginBottom: '16px'
            }}>
              <button
                onClick={handleDeletePost}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#dc2626',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#fee2e2';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fef2f2';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🗑️ Delete Post
              </button>
            </div>
          )}

          {/* Reactions */}
          {role === 'mentee' && (
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '24px',
              borderTop: '1px solid #f1f5f9'
            }}>
              <button
                onClick={() => handleReact('❤️')}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#fee2e2';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fef2f2';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ❤️ {post.reactionSummary?.heart || 0}
              </button>
              <button
                onClick={() => handleReact('👍')}
                style={{
                  background: '#f0f9ff',
                  border: '1px solid #e0f2fe',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e0f2fe';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f0f9ff';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                👍 {post.reactionSummary?.thumbsUp || 0}
              </button>
              <button
                onClick={() => handleReact('🔥')}
                style={{
                  background: '#fefce8',
                  border: '1px solid #fef9c3',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#ca8a04',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#fef9c3';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fefce8';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🔥 {post.reactionSummary?.fire || 0}
              </button>
            </div>
          )}

          {/* Reaction Summary for mentors */}
          {role === 'mentor' && (post.reactionSummary?.heart || post.reactionSummary?.thumbsUp || post.reactionSummary?.fire) && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: '#f0f9ff',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#64748b',
              border: '1px solid #e0f2fe'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: '#0369a1' }}>
                Reaction Summary
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {post.reactionSummary.heart > 0 && (
                  <span style={{ fontSize: '16px' }}>❤️ {post.reactionSummary.heart}</span>
                )}
                {post.reactionSummary.thumbsUp > 0 && (
                  <span style={{ fontSize: '16px' }}>👍 {post.reactionSummary.thumbsUp}</span>
                )}
                {post.reactionSummary.fire > 0 && (
                  <span style={{ fontSize: '16px' }}>🔥 {post.reactionSummary.fire}</span>
                )}
                {(!post.reactionSummary.heart && !post.reactionSummary.thumbsUp && !post.reactionSummary.fire) && (
                  <span style={{ fontStyle: 'italic' }}>No reactions yet</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Community Info Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Community Information
          </h4>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#64748b',
            lineHeight: '1.6'
          }}>
            {post.communityId?.description || 'No description available'}
          </p>
          <Link
            to={`/community-chats/${communityId}`}
            style={{
              display: 'inline-block',
              marginTop: '12px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            View All Posts →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;

