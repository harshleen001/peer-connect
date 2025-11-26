// CommunityChatsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communitiesAPI, communityPostsAPI, communityReactionsAPI, requestAPI, pollAPI } from './api';

// dynamic state only; messages will be loaded from backend

const Avatar = ({ seed }) => {
  return <div className="avatar">{seed}</div>;
};

const MessageCard = ({ message, onLike, onReply }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'tip': return '#10b981';
      case 'question': return '#f59e0b';
      case 'post': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'tip': return '💡';
      case 'question': return '❓';
      case 'post': return '📝';
      default: return '💬';
    }
  };

  return (
    <div className="message-card">
      <div className="message-header">
        <Avatar seed={message.avatar} />
        <div className="message-meta">
          <div className="user-info">
            <span className="username">{message.user}</span>
            <span
              className="message-type"
              style={{ backgroundColor: getTypeColor(message.type) }}
            >
              {getTypeIcon(message.type)} {message.type}
            </span>
          </div>
          <span className="timestamp">{message.timestamp}</span>
        </div>
      </div>
      <div className="message-content">
        {message.message}
      </div>
      <div className="message-actions">
        <button
          className="action-btn like-btn"
          onClick={() => onLike(message.id)}
        >
          ❤️ {message.likes}
        </button>
        <button
          className="action-btn reply-btn"
          onClick={() => onReply(message.id)}
        >
          💬 {message.replies}
        </button>
        <button className="action-btn share-btn">
          🔗 Share
        </button>
      </div>
    </div>
  );
};

const PollModal = ({ isOpen, onClose, onSave }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (question.trim() && validOptions.length >= 2) {
      onSave({ question: question.trim(), options: validOptions });
      setQuestion('');
      setOptions(['', '']);
      onClose();
    } else {
      alert('Please provide a question and at least 2 options');
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
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Create Poll</h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Poll Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Options (minimum 2)
          </label>
          {options.map((opt, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  style={{
                    padding: '8px 12px',
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    borderRadius: '8px',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {options.length < 10 && (
            <button
              onClick={addOption}
              style={{
                padding: '8px 16px',
                background: '#f0f9ff',
                border: '1px solid #e0f2fe',
                borderRadius: '8px',
                color: '#0369a1',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              + Add Option
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Add Poll
          </button>
        </div>
      </div>
    </div>
  );
};

const PostComposer = ({ activeChat, onPost, disabled, onAttach, onLinkChange, linkUrl, fileName }) => {
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('post');
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollData, setPollData] = useState(null);
  const fileRef = useRef(null);

  const handleSubmit = () => {
    if (disabled) return;
    if (postContent.trim()) {
      onPost({
        user: 'You',
        avatar: 'YU',
        message: postContent,
        timestamp: 'now',
        type: postType,
        likes: 0,
        replies: 0,
        pollData
      });
      setPostContent('');
      setPollData(null);
    }
  };

  const handlePollSave = (poll) => {
    setPollData(poll);
    setShowPollModal(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="post-composer">
      <div className="composer-header">
        <Avatar seed="YU" />
        <select
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          className="post-type-select"
        >
          <option value="post">📝 Share Update</option>
          <option value="tip">💡 Share Tip</option>
          <option value="question">❓ Ask Question</option>
        </select>
      </div>
      <div>
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`What would you like to share with the ${activeChat.replace('-', ' ')} community?`}
          className="composer-textarea"
          rows={3}
        />
        <div className="composer-actions">
          <div className="composer-tools">
            <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onAttach?.(f); }} />
            <button type="button" className="tool-btn" title="Add Image/Doc" onClick={() => fileRef.current?.click()}>📎</button>
            {fileName && <span style={{ fontSize: 12, color: '#64748b' }}>{fileName}</span>}
            <input
              type="url"
              placeholder="Paste a link (optional)"
              value={linkUrl}
              onChange={(e) => onLinkChange?.(e.target.value)}
              style={{ marginLeft: 8, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, minWidth: 180 }}
            />
            <button
              type="button"
              className="tool-btn"
              title="Add Poll"
              onClick={() => setShowPollModal(true)}
              style={pollData ? { background: '#dbeafe', color: '#1e40af' } : {}}
            >
              📊 {pollData ? 'Poll Added' : 'Poll'}
            </button>
            {pollData && (
              <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>
                {pollData.question}
              </span>
            )}
            <button type="button" className="tool-btn" title="Add Code">💻</button>
          </div>
          <div className="composer-submit">
            <span className="keyboard-hint">Ctrl+Enter to post</span>
            <button
              onClick={handleSubmit}
              className="post-btn"
              disabled={disabled || !postContent.trim()}
            >
              Post to #{activeChat}
            </button>
          </div>
        </div>
      </div>
      <PollModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        onSave={handlePollSave}
      />
    </div>
  );
};

const CommunityChatsPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(chatId || ''); // holds communityId
  const [messages, setMessages] = useState([]); // backend posts
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(24);
  const [isTyping, setIsTyping] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [discoverCommunities, setDiscoverCommunities] = useState([]);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const role = (localStorage.getItem('role') || '').toLowerCase();
  const [pendingFile, setPendingFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [polls, setPolls] = useState({}); // Store polls by postId

  // Update active chat when URL parameter changes
  useEffect(() => {
    if (chatId) {
      setActiveChat(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    // Simulate online indicator
    const interval = setInterval(() => {
      setOnlineUsers(prev => Math.max(15, prev + Math.floor(Math.random() * 6) - 3));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Simulate typing indicator
  useEffect(() => {
    const typingInterval = setInterval(() => {
      const shouldShowTyping = Math.random() > 0.7;
      if (shouldShowTyping) {
        const mentors = ['Harshleen Kaur', 'DishavPreet Kaur', 'Manraj Singh', 'Padampreet Singh'];
        const randomMentor = mentors[Math.floor(Math.random() * mentors.length)];
        setIsTyping([randomMentor]);
        setTimeout(() => setIsTyping([]), 3000);
      }
    }, 10000);

    return () => clearInterval(typingInterval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, activeChat]);

  // Load user's communities and discover list (mentees limited to mentors' communities)
  useEffect(() => {
    const load = async () => {
      try {
        const mine = await communitiesAPI.mine();
        setMyCommunities(mine || []);

        if (role === 'mentee') {
          const conns = await requestAPI.connections(localStorage.getItem('token'));
          const mentorIds = new Set((conns || []).map(c => c.mentorId?._id || c.mentorId));
          const all = await communitiesAPI.list();
          const allowed = (all || []).filter(c => mentorIds.has(c.mentorId?._id || c.mentorId));
          setDiscoverCommunities(allowed);
        }
      } catch (err) {
        console.error('load communities:', err);
      }
    };
    load();
  }, [role]);

  const handleReact = async (postId, reaction) => {
    try {
      await communityReactionsAPI.react(postId, reaction);
      // Reload posts to get updated reaction counts
      if (activeChat) {
        const posts = await communityPostsAPI.list(activeChat);
        setMessages(posts);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to react');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await communityPostsAPI.delete(activeChat, postId);
      // Reload posts after deletion
      const posts = await communityPostsAPI.list(activeChat);
      setMessages(posts);

      // Remove poll from state if exists
      if (polls[postId]) {
        const newPolls = { ...polls };
        delete newPolls[postId];
        setPolls(newPolls);
      }

      alert('Post deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to delete post');
    }
  };

  const handleVote = async (postId, optionIndex) => {
    try {
      const currentPoll = polls[postId];
      const hasVoted = currentPoll?.hasVoted || false;

      // Use PATCH for re-voting, POST for first vote
      const updatedPoll = hasVoted
        ? await pollAPI.revote(postId, optionIndex)
        : await pollAPI.vote(postId, optionIndex);

      // Update poll in state
      setPolls(prev => ({
        ...prev,
        [postId]: {
          ...updatedPoll.poll,
          hasVoted: true,
          userVoteIndex: optionIndex
        }
      }));

      // Reload posts to get updated data
      const posts = await communityPostsAPI.list(activeChat);
      setMessages(posts);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to vote');
    }
  };

  const handleReply = (messageId) => {
    // In a real app, this would open a reply interface
    alert(`Reply feature coming soon! Message ID: ${messageId}`);
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

  const handlePost = async (newPost) => {
    try {
      if (!activeChat) return;
      let mediaUrl = linkUrl && linkUrl.trim() ? linkUrl.trim() : undefined;
      if (pendingFile) {
        const { mediaUrl: uploadedUrl } = await communityPostsAPI.upload(activeChat, pendingFile);
        mediaUrl = uploadedUrl;
      }
      const createdPost = await communityPostsAPI.create(activeChat, { content: newPost.message, mediaUrl });

      // Create poll if poll data exists
      if (createdPost && createdPost._id && newPost.pollData) {
        try {
          await pollAPI.create(createdPost._id, newPost.pollData);
        } catch (pollErr) {
          console.error('Failed to create poll:', pollErr);
          alert('Post created but poll failed. You can add it later.');
        }
      }

      // Redirect to post detail page after successful creation
      if (createdPost && createdPost._id) {
        navigate(`/community-chats/${activeChat}/posts/${createdPost._id}`);
      } else {
        // Fallback: reload posts if redirect fails
        const posts = await communityPostsAPI.list(activeChat);
        setMessages(posts);
        setPendingFile(null);
        setLinkUrl('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to post');
    }
  };

  // Load posts when activeChat changes
  useEffect(() => {
    const loadPosts = async () => {
      try {
        if (!activeChat) return;
        const posts = await communityPostsAPI.list(activeChat);
        setMessages(posts);

        // Load polls for posts that have them
        const postsWithPolls = posts.filter(p => p.hasPoll);
        const pollPromises = postsWithPolls.map(async (post) => {
          try {
            const poll = await pollAPI.get(post._id);
            return { postId: post._id, poll };
          } catch (err) {
            console.error(`Failed to load poll for post ${post._id}:`, err);
            return null;
          }
        });

        const pollResults = await Promise.all(pollPromises);
        const pollsMap = {};
        pollResults.forEach(result => {
          if (result) {
            pollsMap[result.postId] = result.poll;
          }
        });
        setPolls(pollsMap);
      } catch (err) {
        console.error('load posts:', err);
      }
    };
    loadPosts();
  }, [activeChat]);

  const filteredMessages = (messages || []).filter(msg =>
    (msg.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (msg.mentorId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeChatter = myCommunities.find(c => String(c._id) === String(activeChat))
    || discoverCommunities.find(c => String(c._id) === String(activeChat));

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      height: '100vh',
      display: 'flex',
      backgroundColor: '#f8fafc'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '320px',
        backgroundColor: 'white',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
          <div style={{
            padding: '24px 20px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <h2 style={{
              margin: '0 0 8px 0',
              fontSize: '24px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Community Chats
            </h2>

            {/* Dynamic active members: compute from recent posts + typing indicator */}
            {(() => {
              const windowMs = 1000 * 60 * 60; // last 60 minutes
              const now = Date.now();
              const seen = new Map();

              (messages || []).forEach(m => {
                try {
            const ts = new Date(m.createdAt || Date.now()).getTime();
            if (now - ts <= windowMs) {
              const id = m.mentorId?._id || m.mentorId || m.user || m._id;
              const name = m.mentorId?.name || m.user || 'Member';
              if (!seen.has(id)) seen.set(id, name);
            }
                } catch (e) {
            /* ignore bad dates */
                }
              });

              // include typing users as active
              (isTyping || []).forEach((n, i) => seen.set(`typing-${i}`, n));

              const activeNames = Array.from(seen.values()).slice(0, 6);
              const totalActive = seen.size || 0;

              return (
                <div style={{
            fontSize: '14px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
                }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {activeNames.map((name, idx) => (
                <div
                  key={idx}
                  title={name}
                  style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e3a8a',
              fontWeight: 700,
              fontSize: 12,
              boxShadow: '0 1px 4px rgba(16,24,40,0.06)'
                  }}
                >
                  {String(name).split(' ').map(p => p[0]).slice(0,2).join('')}
                </div>
              ))}
              {totalActive > activeNames.length && (
                <div style={{
                  fontSize: 12,
                  color: '#94a3b8',
                  marginLeft: 4
                }}>
                  +{totalActive - activeNames.length}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: totalActive > 0 ? '#10b981' : '#9ca3af'
              }} />
              <div>{totalActive} members online</div>
            </div>
                </div>
              );
            })()}
          </div>

          {/* Search */}
        <div style={{ padding: '16px 20px' }}>
          <input
            type="text"
            placeholder="🔍 Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
              backgroundColor: '#f9fafb'
            }}
          />
        </div>

        {/* Chat List (My Communities) */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 10px' }}>
          {(myCommunities || []).map(chat => (
            <button
              key={chat._id}
              onClick={() => setActiveChat(chat._id)}
              style={{
                width: '100%',
                padding: '16px 16px',
                margin: '4px 0',
                border: 'none',
                backgroundColor: String(activeChat) === String(chat._id) ? '#f1f5f9' : 'transparent',
                borderLeft: String(activeChat) === String(chat._id) ? `4px solid #8b5cf6` : '4px solid transparent',
                borderRadius: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (String(activeChat) !== String(chat._id)) {
                  e.target.style.backgroundColor = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (String(activeChat) !== String(chat._id)) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%'
              }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#8b5cf6'
                  }}
                />
                <span style={{
                  fontWeight: String(activeChat) === String(chat._id) ? '600' : '500',
                  fontSize: '15px',
                  color: '#1f2937'
                }}>
                  #{String(chat.name || '').replace(/\s+/g, '-').toLowerCase()}
                </span>
              </div>
              <span style={{
                fontSize: '13px',
                color: '#64748b',
                marginLeft: '22px',
                lineHeight: '1.4'
              }}>
                {chat.description}
              </span>
              <div style={{
                fontSize: '12px',
                color: '#9ca3af',
                marginLeft: '22px',
                display: 'flex',
                justifyContent: 'space-between',
                width: 'calc(100% - 22px)'
              }}>
                <span>{(chat.members || []).length} members</span>
                {String(activeChat) === String(chat._id) && <span>●</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Discover (mentees only) */}
        {role === 'mentee' && (
          <div style={{ borderTop: '1px solid #e2e8f0', padding: '12px 10px' }}>
            <h4 style={{ margin: '8px 0' }}>Discover from Your Mentors</h4>
            {(discoverCommunities || []).map(c => (
              <div key={c._id} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{c.description}</div>
                <button onClick={async () => { await communitiesAPI.join(c._id); setMyCommunities(prev => [...prev, c]); }} style={{ marginTop: 6, padding: '6px 10px', borderRadius: 6, border: 'none', background: '#667eea', color: 'white', cursor: 'pointer' }}>Join</button>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e2e8f0',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Total Messages Today</span>
            <span style={{ fontWeight: '600' }}>
              {
                (messages || []).filter(m => {
                  try {
                    return new Date(m.createdAt || Date.now()).toDateString() === new Date().toDateString();
                  } catch {
                    return false;
                  }
                }).length
              }
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Active Mentors</span>
            <span style={{ fontWeight: '600' }}>
              {
                new Set(
                  ([...(myCommunities || []), ...(discoverCommunities || [])]
                    .map(c => c?.mentorId?._id || c?.mentorId)
                    .filter(Boolean)
                  )
                ).size
              }
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <div style={{
          padding: '20px 24px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: activeChatter?.color || '#8b5cf6'
            }}
          />
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              #{activeChatter?.name || 'Select a community'}
            </h3>
            <p style={{
              margin: '2px 0 0 0',
              fontSize: '14px',
              color: '#64748b'
            }}>
              {activeChatter?.description} • {(activeChatter?.members || []).length} members • {filteredMessages.length} messages
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              📌 Pinned
            </button>
            <button style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Only show PostComposer for mentors who own the community */}
          {role === 'mentor' && activeChatter && String(activeChatter?.mentorId?._id || activeChatter?.mentorId) === String(user?._id) && (
            <PostComposer
              activeChat={activeChat}
              onPost={handlePost}
              onAttach={(file) => setPendingFile(file)}
              onLinkChange={setLinkUrl}
              linkUrl={linkUrl}
              fileName={pendingFile?.name}
              disabled={!activeChatter}
            />
          )}

          {filteredMessages.map(message => (
            <div
              key={message._id}
              className="message-card"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                // Don't navigate if clicking on action buttons, links, or poll
                if (e.target.closest('.message-actions') || e.target.closest('a') || e.target.closest('[data-poll]')) {
                  return;
                }
                navigate(`/community-chats/${activeChat}/posts/${message._id}`);
              }}
            >
              <div className="message-header">
                <div
                  className="avatar"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (message.mentorId?._id || message.mentorId) {
                      navigate(`/profile/${message.mentorId._id || message.mentorId}`);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {(message.mentorId?.name || 'M').split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="message-meta">
                  <div className="user-info">
                    <span
                      className="username"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (message.mentorId?._id || message.mentorId) {
                          navigate(`/profile/${message.mentorId._id || message.mentorId}`);
                        }
                      }}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {message.mentorId?.name || 'Mentor'}
                    </span>
                    <span className="message-type" style={{ backgroundColor: '#3b82f6' }}>📝 post</span>
                  </div>
                  <span className="timestamp">{new Date(message.createdAt || Date.now()).toLocaleString()}</span>
                </div>
              </div>
              <div className="message-content">
                {message.content}
                {message.mediaUrl && (
                  message.mediaUrl.match(/\.(png|jpe?g|gif|webp)$/i) ? (
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                      <img
                        src={getFullUrl(message.mediaUrl)}
                        alt="attachment"
                        style={{
                          maxWidth: '400px',
                          maxHeight: '300px',
                          width: 'auto',
                          height: 'auto',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  ) : message.mediaUrl.match(/\.pdf$/i) ? (
                    <div style={{ marginTop: 8, padding: '12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px' }}>📄</span>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>PDF Document</span>
                      </div>
                      <a
                        href={getFullUrl(message.mediaUrl)}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#2563eb',
                          textDecoration: 'none',
                          fontWeight: '500',
                          fontSize: '14px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        → Open PDF in Browser
                      </a>
                    </div>
                  ) : (
                    <div style={{ marginTop: 8 }}>
                      <a
                        href={getFullUrl(message.mediaUrl)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#2563eb' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        🔗 Open Link / Attachment
                      </a>
                    </div>
                  )
                )}

                {/* Poll Display */}
                {message.hasPoll && polls[message._id] && (
                  <div
                    data-poll
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      marginTop: '16px',
                      padding: '16px',
                      background: '#f0f9ff',
                      borderRadius: '12px',
                      border: '1px solid #e0f2fe'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      <span style={{ fontSize: '20px' }}>📊</span>
                      <h4 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {polls[message._id].question}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {polls[message._id].options.map((option, index) => {
                        const percentage = polls[message._id].totalVotes > 0
                          ? Math.round((option.count / polls[message._id].totalVotes) * 100)
                          : 0;
                        const isSelected = polls[message._id].userVoteIndex === index;
                        const hasVoted = polls[message._id].hasVoted;

                        return (
                          <div key={index}>
                            {/* For mentees: show clickable buttons if not voted, or if voted show clickable options with results */}
                            {role === 'mentee' ? (
                              <button
                                onClick={() => handleVote(message._id, index)}
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  background: isSelected ? '#dbeafe' : 'white',
                                  border: `2px solid ${isSelected ? '#3b82f6' : '#e0f2fe'}`,
                                  borderRadius: '8px',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  color: '#374151',
                                  transition: 'all 0.2s ease',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.background = '#f0f9ff';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.target.style.borderColor = '#e0f2fe';
                                    e.target.style.background = 'white';
                                  }
                                }}
                              >
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  position: 'relative',
                                  zIndex: 2
                                }}>
                                  <span style={{
                                    fontSize: '14px',
                                    fontWeight: isSelected ? '600' : '500',
                                    color: '#374151'
                                  }}>
                                    {isSelected && <span style={{ marginRight: '8px' }}>✓</span>}
                                    {option.text}
                                  </span>
                                  {hasVoted && (
                                    <span style={{
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      color: '#64748b'
                                    }}>
                                      {option.count} {option.count === 1 ? 'vote' : 'votes'} {percentage > 0 && `(${percentage}%)`}
                                    </span>
                                  )}
                                </div>
                                {hasVoted && percentage > 0 && (
                                  <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '100%',
                                    width: `${percentage}%`,
                                    background: isSelected ? '#93c5fd' : '#e0f2fe',
                                    opacity: 0.3,
                                    zIndex: 1,
                                    transition: 'width 0.3s ease'
                                  }} />
                                )}
                              </button>
                            ) : (
                              /* For mentors: show results only */
                              <div style={{
                                padding: '12px 16px',
                                background: 'white',
                                border: '2px solid #e0f2fe',
                                borderRadius: '8px',
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  position: 'relative',
                                  zIndex: 2
                                }}>
                                  <span style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151'
                                  }}>
                                    {option.text}
                                  </span>
                                  <span style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#64748b'
                                  }}>
                                    {option.count} {option.count === 1 ? 'vote' : 'votes'} {percentage > 0 && `(${percentage}%)`}
                                  </span>
                                </div>
                                {percentage > 0 && (
                                  <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '100%',
                                    width: `${percentage}%`,
                                    background: '#e0f2fe',
                                    opacity: 0.3,
                                    zIndex: 1,
                                    transition: 'width 0.3s ease'
                                  }} />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{
                      marginTop: '12px',
                      fontSize: '12px',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexWrap: 'wrap'
                    }}>
                      <span>📊 {polls[message._id].totalVotes} {polls[message._id].totalVotes === 1 ? 'vote' : 'votes'}</span>
                      {polls[message._id].hasVoted && role === 'mentee' && (
                        <>
                          <span style={{ marginLeft: '8px' }}>• You voted</span>
                          <span style={{ marginLeft: '8px', fontStyle: 'italic' }}>• Click to change vote</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Delete button for mentors (only on their own posts) */}
              {role === 'mentor' && String(message.mentorId?._id || message.mentorId) === String(user?._id) && (
                <div className="message-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeletePost(message._id)}
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fee2e2',
                      color: '#dc2626'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}

              {/* Reaction buttons for mentees */}
              {role === 'mentee' && (
                <div className="message-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="action-btn like-btn" onClick={() => handleReact(message._id, '❤️')}>
                    ❤️ {message.reactionSummary?.heart || 0}
                  </button>
                  <button className="action-btn reply-btn" onClick={() => handleReact(message._id, '👍')}>
                    👍 {message.reactionSummary?.thumbsUp || 0}
                  </button>
                  <button className="action-btn share-btn" onClick={() => handleReact(message._id, '🔥')}>
                    🔥 {message.reactionSummary?.fire || 0}
                  </button>
                </div>
              )}

              {/* Reaction summary for mentors */}
              {role === 'mentor' && (message.reactionSummary?.heart || message.reactionSummary?.thumbsUp || message.reactionSummary?.fire) && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#64748b',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: '600' }}>Reactions:</span>
                  {message.reactionSummary.heart > 0 && (
                    <span>❤️ {message.reactionSummary.heart}</span>
                  )}
                  {message.reactionSummary.thumbsUp > 0 && (
                    <span>👍 {message.reactionSummary.thumbsUp}</span>
                  )}
                  {message.reactionSummary.fire > 0 && (
                    <span>🔥 {message.reactionSummary.fire}</span>
                  )}
                </div>
              )}
              <div style={{
                marginTop: '12px',
                fontSize: '12px',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>👆 Click to view full post</span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping.length > 0 && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#64748b',
              fontStyle: 'italic'
            }}>
              {isTyping.join(', ')} {isTyping.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <style>{`
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .message-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
        }

        .message-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
          border-color: #e2e8f0;
          background: #fefefe;
        }

        .message-header {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .message-meta {
          flex: 1;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .username {
          font-weight: 600;
          color: #1f2937;
          font-size: 15px;
        }

        .message-type {
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 12px;
          color: white;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .timestamp {
          color: #64748b;
          font-size: 13px;
        }

        .message-content {
          color: #374151;
          line-height: 1.7;
          margin-bottom: 16px;
          font-size: 15px;
        }

        .message-actions {
          display: flex;
          gap: 16px;
        }

        .action-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 13px;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .action-btn:hover {
          background: #f1f5f9;
          color: #1f2937;
          transform: translateY(-1px);
        }

        .like-btn:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .reply-btn:hover {
          background: #f0f9ff;
          color: #0369a1;
        }

        .share-btn:hover {
          background: #f0fdf4;
          color: #166534;
        }

        .post-composer {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          margin-bottom: 24px;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .composer-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .post-type-select {
          padding: 8px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          cursor: pointer;
          font-weight: 500;
        }

        .post-type-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .composer-textarea {
          width: 100%;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          font-size: 15px;
          line-height: 1.6;
          resize: vertical;
          font-family: inherit;
          margin-bottom: 16px;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .composer-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .composer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .composer-tools {
          display: flex;
          gap: 8px;
        }

        .tool-btn {
          background: none;
          border: none;
          padding: 10px;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 18px;
        }

        .tool-btn:hover {
          background: #f1f5f9;
          transform: scale(1.1);
        }

        .composer-submit {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .keyboard-hint {
          font-size: 12px;
          color: #9ca3af;
          font-style: italic;
        }

        .post-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .post-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .post-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 768px) {
          .message-card {
            padding: 16px;
            border-radius: 12px;
          }
          
          .composer-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          
          .keyboard-hint {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CommunityChatsPage;