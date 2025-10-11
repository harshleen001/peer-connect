// LeaderboardPage.jsx
import React from 'react';

const LeaderboardPage = ({ mentors = [] }) => {
  // Sort mentors by rating in descending order
  const sortedMentors = [...mentors].sort((a, b) => b.rating - a.rating);

  const getMedalIcon = (position) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return position;
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
              fontSize: '16px'
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

  const getPositionStyle = (position) => {
    if (position <= 3) {
      return {
        background: position === 1 
          ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
          : position === 2 
          ? 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)' 
          : 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        transform: position === 1 ? 'scale(1.02)' : 'none'
      };
    }
    return {
      background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F1F5F9' }}>
      {/* Note: Header component will be included when used in your app */}
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Header Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '3rem 2rem',
          borderRadius: '20px',
          color: 'white',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            🏆
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            margin: '0',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Mentor Leaderboard
          </h1>
          <p style={{
            fontSize: '1.1rem',
            margin: '1rem 0 0 0',
            opacity: '0.9'
          }}>
            Top-rated mentors ranked by their expertise and student feedback
          </p>
        </div>

        {/* Leaderboard */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          {sortedMentors.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#6B7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3>No mentors found</h3>
              <p>The leaderboard will populate once mentors are available.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sortedMentors.map((mentor, index) => {
                const position = index + 1;
                return (
                  <div
                    key={mentor.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1.5rem',
                      borderRadius: '15px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      ...getPositionStyle(position)
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = position === 1 ? 'scale(1.03)' : 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = position === 1 ? 'scale(1.02)' : 'none';
                    }}
                  >
                    {/* Position */}
                    <div style={{
                      minWidth: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: position <= 3 ? '2rem' : '1.5rem',
                      fontWeight: 'bold',
                      color: position <= 3 ? 'white' : '#374151'
                    }}>
                      {getMedalIcon(position)}
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: mentor.bgColor || `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      marginRight: '1.5rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    {/* Mentor Info */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.4rem',
                        fontWeight: 'bold',
                        color: position <= 3 ? 'white' : '#1F2937'
                      }}>
                        {mentor.name}
                      </h3>
                      <p style={{
                        margin: '0 0 0.5rem 0',
                        color: position <= 3 ? 'rgba(255,255,255,0.9)' : '#6B7280',
                        fontSize: '1rem'
                      }}>
                        {mentor.expertise} • {mentor.mentees} mentees
                      </p>
                      <div style={{ marginTop: '0.5rem' }}>
                        {getStarRating(mentor.rating)}
                      </div>
                    </div>

                    {/* Rating Score */}
                    <div style={{
                      textAlign: 'right',
                      minWidth: '100px'
                    }}>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: position <= 3 ? 'white' : '#1F2937'
                      }}>
                        {mentor.rating.toFixed(1)}
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: position <= 3 ? 'rgba(255,255,255,0.8)' : '#6B7280',
                        marginTop: '0.25rem'
                      }}>
                        Rating
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍🏫</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937' }}>
              {sortedMentors.length}
            </div>
            <div style={{ color: '#6B7280' }}>Total Mentors</div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937' }}>
              {sortedMentors.reduce((sum, mentor) => sum + mentor.mentees, 0)}
            </div>
            <div style={{ color: '#6B7280' }}>Total Mentees</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;