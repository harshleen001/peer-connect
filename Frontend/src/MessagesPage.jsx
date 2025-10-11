// MessagesPage.jsx
import React, { useState, useMemo } from 'react';

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data - replace with real data later
  const [chats] = useState([
    { 
      id: 1, 
      name: 'Harshleen Kaur', 
      role: 'Senior Developer', 
      lastMessage: 'Thanks for the code review feedback!', 
      time: '10:30 AM', 
      unread: 2, 
      avatar: '👩‍💻' 
    },
    { 
      id: 2, 
      name: 'Dishavpreet', 
      role: 'Product Manager', 
      lastMessage: 'Can we schedule a meeting to discuss the roadmap?', 
      time: '9:15 AM', 
      unread: 0, 
      avatar: '👨‍💼' 
    },
    { 
      id: 3, 
      name: 'Manraj Khehra', 
      role: 'UX Designer', 
      lastMessage: 'I\'ve updated the design mockups', 
      time: 'Yesterday', 
      unread: 1, 
      avatar: '👩‍🎨' 
    },
  ]);

  const [messages] = useState({
    1: [
      { id: 1, text: 'Hi! I reviewed your latest pull request.', sender: 'them', time: '10:15 AM' },
      { id: 2, text: 'The implementation looks good overall, just a few minor suggestions.', sender: 'them', time: '10:16 AM' },
      { id: 3, text: 'Thanks! I\'ll make those changes.', sender: 'me', time: '10:25 AM' },
      { id: 4, text: 'Thanks for the code review feedback!', sender: 'them', time: '10:30 AM' }
    ],
    2: [
      { id: 1, text: 'Hey! Hope you\'re doing well.', sender: 'them', time: '9:00 AM' },
      { id: 2, text: 'Can we schedule a meeting to discuss the roadmap?', sender: 'them', time: '9:15 AM' }
    ],
    3: [
      { id: 1, text: 'I\'ve updated the design mockups', sender: 'them', time: 'Yesterday' },
      { id: 2, text: 'Could you take a look when you have time?', sender: 'them', time: 'Yesterday' }
    ]
  });

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    
    const query = searchQuery.toLowerCase();
    return chats.filter(chat => 
      chat.name.toLowerCase().includes(query) ||
      chat.role.toLowerCase().includes(query) ||
      chat.lastMessage.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: '#f5f7fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Chat List Sidebar */}
      <div style={{ 
        width: '350px', 
        background: 'white', 
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid #f0f0f0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>
            Messages
          </h2>
        </div>

        {/* Search Bar */}
        <div style={{ 
          padding: '1rem',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              fontSize: '1.2rem',
              color: '#999'
            }}>
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                background: '#f8f9fa'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.background = '#f8f9fa';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: '#999',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.85rem',
              color: '#666'
            }}>
              {filteredChats.length} result{filteredChats.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>

        {/* Chat List */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto' 
        }}>
          {filteredChats.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#999'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ margin: 0 }}>No conversations found</p>
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Clear Search
              </button>
            </div>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  background: selectedChat?.id === chat.id ? '#f0f4ff' : 'white',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedChat?.id !== chat.id) {
                    e.currentTarget.style.background = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedChat?.id !== chat.id) {
                    e.currentTarget.style.background = 'white';
                  }
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    fontSize: '2.5rem',
                    flexShrink: 0
                  }}>
                    {chat.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.25rem'
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#2c3e50'
                      }}>
                        {chat.name}
                      </h3>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#999'
                      }}>
                        {chat.time}
                      </span>
                    </div>
                    <p style={{
                      margin: '0.25rem 0',
                      fontSize: '0.9rem',
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {chat.lastMessage}
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '0.25rem'
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#999'
                      }}>
                        {chat.role}
                      </span>
                      {chat.unread > 0 && (
                        <span style={{
                          background: '#667eea',
                          color: 'white',
                          borderRadius: '12px',
                          padding: '0.15rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        background: 'white'
      }}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e0e0e0',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '2.5rem' }}>
                {selectedChat.avatar}
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#2c3e50'
                }}>
                  {selectedChat.name}
                </h3>
                <p style={{
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.9rem',
                  color: '#999'
                }}>
                  {selectedChat.role}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              background: '#f8f9fa'
            }}>
              {messages[selectedChat.id]?.map(message => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{
                    maxWidth: '60%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.sender === 'me' ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '18px',
                      background: message.sender === 'me' 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'white',
                      color: message.sender === 'me' ? 'white' : '#2c3e50',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      wordBreak: 'break-word'
                    }}>
                      {message.text}
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#999',
                      marginTop: '0.25rem',
                      padding: '0 0.5rem'
                    }}>
                      {message.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div style={{
              padding: '1.5rem',
              borderTop: '1px solid #e0e0e0',
              background: 'white',
              display: 'flex',
              gap: '1rem'
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '25px',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#666' }}>
              Select a conversation
            </h3>
            <p style={{ margin: 0, fontSize: '1rem' }}>
              Choose a chat from the sidebar to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;