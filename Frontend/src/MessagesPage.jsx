// MessagesPage.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { chatsAPI } from './api';
import { getSocket, initSocket } from './socket';

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({}); // { [chatId]: [...] }
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentChatIdRef = useRef(null);
  const messagesEndRef = useRef(null);
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const data = await chatsAPI.list();
        // Map backend chats to sidebar model
        const mapped = data.map((c) => {
          const other = (c.participants || []).find(p => (p?._id || p) !== currentUser._id);
          return {
            id: c._id,
            name: other?.name || 'Chat',
            role: other?.role || '',
            lastMessage: (c.messages && c.messages.length > 0) ? c.messages[c.messages.length - 1].text : '',
            time: (c.messages && c.messages.length > 0) ? new Date(c.messages[c.messages.length - 1].timestamp).toLocaleString() : '',
            unread: 0,
            avatar: '💬'
          };
        });
        setChats(mapped);
        // Auto-select chat if provided via navigation state or query parameter
        const targetId = location.state?.chatId || searchParams.get('chatId');
        if (targetId) {
          const found = mapped.find(m => m.id === targetId);
          if (found) setSelectedChat(found);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadChats();
  }, [currentUser._id, location.state?.chatId, searchParams]);

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

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat) return;
      try {
        const list = await chatsAPI.getMessages(selectedChat.id);
        const mapped = list.map((m, idx) => ({
          id: m._id || idx,
          text: m.text,
          sender: (m.senderId?._id || m.senderId) === currentUser._id ? 'me' : 'them',
          time: m.timestamp ? new Date(m.timestamp).toLocaleString() : ''
        }));
        setMessages(prev => ({ ...prev, [selectedChat.id]: mapped }));
      } catch (e) {
        console.error(e);
      }
    };
    loadMessages();
  }, [selectedChat, currentUser._id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && selectedChat) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages[selectedChat?.id], selectedChat]);

  // ✅ Socket: Join/leave chat rooms and listen for real-time messages
  useEffect(() => {
    let socket = getSocket();
    if (!socket && currentUser?._id) {
      socket = initSocket(currentUser._id);
    }
    if (!socket) return;

    // Leave previous chat room
    if (currentChatIdRef.current) {
      socket.emit("leaveRoom", currentChatIdRef.current);
    }

    // Join new chat room
    if (selectedChat?.id) {
      currentChatIdRef.current = selectedChat.id;
      socket.emit("joinRoom", selectedChat.id);
    } else {
      currentChatIdRef.current = null;
    }

    // Listen for real-time messages
    const handleChatMessage = (data) => {
      if (data.chatId === selectedChat?.id) {
        // Update messages for current chat
        const newMessage = {
          id: data.message._id,
          text: data.message.text,
          sender: (data.message.senderId?._id || data.message.senderId) === currentUser._id ? 'me' : 'them',
          time: data.message.timestamp ? new Date(data.message.timestamp).toLocaleString() : ''
        };
        setMessages(prev => {
          const existing = prev[data.chatId] || [];
          // Check if message already exists (to avoid duplicates from optimistic updates)
          const messageExists = existing.some(m => m.id === newMessage.id);
          if (messageExists) {
            // Message already exists, don't add duplicate
            return prev;
          }
          
          // Check if there's a temp message with same text from same sender (optimistic update)
          const tempIndex = existing.findIndex(m => 
            m.id?.startsWith('temp-') && 
            m.text === newMessage.text && 
            m.sender === newMessage.sender
          );
          
          if (tempIndex !== -1) {
            // Replace temp message with real one
            const updated = [...existing];
            updated[tempIndex] = newMessage;
            return {
              ...prev,
              [data.chatId]: updated
            };
          }
          
          // New message, add it
          return {
            ...prev,
            [data.chatId]: [...existing, newMessage]
          };
        });
      }

      // Update chat list with new last message
      setChats(prev => prev.map(chat => {
        if (chat.id === data.chatId) {
          return {
            ...chat,
            lastMessage: data.message.text,
            time: data.message.timestamp ? new Date(data.message.timestamp).toLocaleString() : chat.time
          };
        }
        return chat;
      }));
    };

    const handleReceiveMessage = (msg) => {
      const roomId = msg.roomId;
      if (roomId === selectedChat?.id) {
        const mapped = {
          id: msg._id,
          text: msg.text,
          sender: (msg.senderId?._id || msg.senderId) === currentUser._id ? 'me' : 'them',
          time: msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''
        };
        setMessages(prev => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), mapped]
        }));
      }
    };

    socket.on("chatMessage", handleChatMessage);
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("chatMessage", handleChatMessage);
      socket.off("receiveMessage", handleReceiveMessage);
      if (currentChatIdRef.current) {
        socket.emit("leaveRoom", currentChatIdRef.current);
      }
    };
  }, [selectedChat, currentUser._id]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat) {
      const messageText = newMessage.trim();
      setNewMessage('');
      
      // Optimistic update - add message immediately
      const tempMessage = {
        id: `temp-${Date.now()}`,
        text: messageText,
        sender: 'me',
        time: new Date().toLocaleString()
      };
      setMessages(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), tempMessage]
      }));

      try {
        await chatsAPI.sendMessage(selectedChat.id, messageText);
        // The real message will come via socket, so we can remove the temp one
        // Or we can keep it and update it when the real one arrives
        // For now, we'll let the socket update handle it
      } catch (e) {
        console.error(e);
        alert('Failed to send message');
        // Remove optimistic message on error
        setMessages(prev => ({
          ...prev,
          [selectedChat.id]: (prev[selectedChat.id] || []).filter(m => m.id !== tempMessage.id)
        }));
      }
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
              <div ref={messagesEndRef} />
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