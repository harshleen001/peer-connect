// CommunityChatsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

// Mock data for chat messages
const initialMessages = {
  'machine-learning': [
    {
      id: 1,
      user: 'Harshleen Kaur',
      avatar: 'HK',
      message: 'Just finished implementing a neural network from scratch! The key insight was understanding backpropagation as gradient descent in parameter space. Happy to share my implementation if anyone is interested.',
      timestamp: '2 hours ago',
      type: 'post',
      likes: 15,
      replies: 3
    },
    {
      id: 2,
      user: 'Padampreet Singh',
      avatar: 'PS',
      message: 'For those working on computer vision projects, I highly recommend starting with transfer learning using pre-trained models like ResNet or VGG. It saves tons of training time and often gives better results.',
      timestamp: '4 hours ago',
      type: 'tip',
      likes: 8,
      replies: 1
    },
    {
      id: 3,
      user: 'Student_ML',
      avatar: 'S1',
      message: 'Can someone explain the difference between supervised and unsupervised learning with practical examples? I\'m having trouble understanding when to use which approach.',
      timestamp: '6 hours ago',
      type: 'question',
      likes: 2,
      replies: 5
    },
    {
      id: 4,
      user: 'Harshleen Kaur',
      avatar: 'HK',
      message: 'Remember that overfitting is one of the biggest challenges in ML. Always keep a validation set separate and use techniques like dropout, regularization, and early stopping.',
      timestamp: '8 hours ago',
      type: 'tip',
      likes: 22,
      replies: 7
    }
  ],
  'web-development': [
    {
      id: 5,
      user: 'DishavPreet Kaur',
      avatar: 'DK',
      message: 'Pro tip: Always validate your APIs with tools like Postman before integrating with frontend. Save yourself hours of debugging! Also, use proper HTTP status codes.',
      timestamp: '1 hour ago',
      type: 'tip',
      likes: 12,
      replies: 2
    },
    {
      id: 6,
      user: 'Manraj Singh Khehra',
      avatar: 'MK',
      message: 'Working on a React project and loving the new useContext hook for state management. Much cleaner than prop drilling! Here\'s a simple example of how I implemented it.',
      timestamp: '3 hours ago',
      type: 'post',
      likes: 9,
      replies: 4
    },
    {
      id: 7,
      user: 'WebDev_Student',
      avatar: 'WS',
      message: 'How do you handle authentication in modern web applications? JWT vs Sessions? What are the security considerations for each approach?',
      timestamp: '5 hours ago',
      type: 'question',
      likes: 6,
      replies: 8
    },
    {
      id: 8,
      user: 'DishavPreet Kaur',
      avatar: 'DK',
      message: 'Database indexing is crucial for performance. Make sure to index your frequently queried columns, but don\'t over-index as it slows down writes.',
      timestamp: '7 hours ago',
      type: 'tip',
      likes: 18,
      replies: 3
    }
  ],
  'competitive-programming': [
    {
      id: 9,
      user: 'Padampreet Singh',
      avatar: 'PS',
      message: 'Solved a challenging dynamic programming problem today! The trick was recognizing the overlapping subproblems pattern. Sometimes drawing the recursion tree helps visualize it.',
      timestamp: '30 minutes ago',
      type: 'post',
      likes: 18,
      replies: 6
    },
    {
      id: 10,
      user: 'Harshleen Kaur',
      avatar: 'HK',
      message: 'Remember: Time complexity analysis is crucial. Always think about Big O notation before implementing your solution. O(n²) might work for small inputs but will timeout on larger ones.',
      timestamp: '2 hours ago',
      type: 'tip',
      likes: 14,
      replies: 2
    },
    {
      id: 11,
      user: 'CP_Enthusiast',
      avatar: 'CC',
      message: 'Any tips for improving problem-solving speed in contests? I can solve problems but I\'m too slow. Need to improve my implementation speed.',
      timestamp: '4 hours ago',
      type: 'question',
      likes: 7,
      replies: 12
    },
    {
      id: 12,
      user: 'Manraj Singh Khehra',
      avatar: 'MK',
      message: 'Graph algorithms are super important for competitive programming. Master BFS, DFS, Dijkstra, and Floyd-Warshall. They appear in 30% of contest problems.',
      timestamp: '6 hours ago',
      type: 'tip',
      likes: 25,
      replies: 8
    }
  ]
};

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

const PostComposer = ({ activeChat, onPost }) => {
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('post');

  const handleSubmit = () => {
    if (postContent.trim()) {
      onPost({
        user: 'You',
        avatar: 'YU',
        message: postContent,
        timestamp: 'now',
        type: postType,
        likes: 0,
        replies: 0
      });
      setPostContent('');
    }
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
            <button type="button" className="tool-btn" title="Add Image">📷</button>
            <button type="button" className="tool-btn" title="Add Link">🔗</button>
            <button type="button" className="tool-btn" title="Add Poll">📊</button>
            <button type="button" className="tool-btn" title="Add Code">💻</button>
          </div>
          <div className="composer-submit">
            <span className="keyboard-hint">Ctrl+Enter to post</span>
            <button 
              onClick={handleSubmit} 
              className="post-btn"
              disabled={!postContent.trim()}
            >
              Post to #{activeChat}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommunityChatsPage = () => {
  const { chatId } = useParams();
  const [activeChat, setActiveChat] = useState(
    chatId || 'machine-learning'
  );
  const [messages, setMessages] = useState(initialMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(24);
  const [isTyping, setIsTyping] = useState([]);
  const messagesEndRef = useRef(null);

  const chats = [
    { 
      id: 'machine-learning', 
      name: 'Machine Learning', 
      members: 156, 
      color: '#8b5cf6',
      description: 'Deep learning, neural networks, AI discussions'
    },
    { 
      id: 'web-development', 
      name: 'Web Development', 
      members: 203, 
      color: '#06b6d4',
      description: 'Frontend, backend, full-stack development'
    },
    { 
      id: 'competitive-programming', 
      name: 'Competitive Programming', 
      members: 89, 
      color: '#f59e0b',
      description: 'Algorithms, data structures, contest prep'
    }
  ];

  // Update active chat when URL parameter changes
  useEffect(() => {
    if (chatId) {
      setActiveChat(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    // Simulate real-time updates
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

  const handleLike = (messageId) => {
    setMessages(prev => ({
      ...prev,
      [activeChat]: prev[activeChat].map(msg =>
        msg.id === messageId ? { ...msg, likes: msg.likes + 1 } : msg
      )
    }));
  };

  const handleReply = (messageId) => {
    // In a real app, this would open a reply interface
    alert(`Reply feature coming soon! Message ID: ${messageId}`);
  };

  const handlePost = (newPost) => {
    const post = {
      ...newPost,
      id: Date.now(),
    };
    
    setMessages(prev => ({
      ...prev,
      [activeChat]: [post, ...prev[activeChat]]
    }));
  };

  const currentMessages = messages[activeChat] || [];
  const filteredMessages = currentMessages.filter(msg =>
    msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeChatter = chats.find(chat => chat.id === activeChat);

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
          <div style={{ 
            fontSize: '14px', 
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981'
            }} />
            {onlineUsers} members online
          </div>
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

        {/* Chat List */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 10px' }}>
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              style={{
                width: '100%',
                padding: '16px 16px',
                margin: '4px 0',
                border: 'none',
                backgroundColor: activeChat === chat.id ? '#f1f5f9' : 'transparent',
                borderLeft: activeChat === chat.id ? `4px solid ${chat.color}` : '4px solid transparent',
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
                if (activeChat !== chat.id) {
                  e.target.style.backgroundColor = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (activeChat !== chat.id) {
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
                    backgroundColor: chat.color
                  }}
                />
                <span style={{
                  fontWeight: activeChat === chat.id ? '600' : '500',
                  fontSize: '15px',
                  color: '#1f2937'
                }}>
                  #{chat.name.replace(/\s+/g, '-').toLowerCase()}
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
                <span>{chat.members} members</span>
                {activeChat === chat.id && <span>●</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e2e8f0',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Total Messages Today</span>
            <span style={{ fontWeight: '600' }}>247</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Active Mentors</span>
            <span style={{ fontWeight: '600' }}>12</span>
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
              #{activeChat}
            </h3>
            <p style={{ 
              margin: '2px 0 0 0', 
              fontSize: '14px', 
              color: '#64748b'
            }}>
              {activeChatter?.description} • {activeChatter?.members} members • {filteredMessages.length} messages
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
          <PostComposer activeChat={activeChat} onPost={handlePost} />
          
          {filteredMessages.map(message => (
            <MessageCard
              key={message.id}
              message={message}
              onLike={handleLike}
              onReply={handleReply}
            />
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