// ProfilePage.jsx
import React, { useState } from "react";

// Sample user data
const sampleUserData = {
  id: 1,
  name: "Harshleen Kaur",
  avatar: "HK",
  userType: "mentor",
  email: "harshleen.kaur@email.com",
  location: "Rajpura, PB",
  bio: "Passionate full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies. I love mentoring aspiring developers and helping them navigate their coding journey.",
  skills: [
    { name: "React", level: "Expert", color: "#61DAFB" },
    { name: "Node.js", level: "Expert", color: "#339933" },
    { name: "JavaScript", level: "Expert", color: "#F7DF1E" },
    { name: "Python", level: "Advanced", color: "#3776AB" },
    { name: "AWS", level: "Advanced", color: "#FF9900" },
    { name: "MongoDB", level: "Intermediate", color: "#47A248" },
    { name: "GraphQL", level: "Intermediate", color: "#E10098" },
    { name: "Docker", level: "Intermediate", color: "#2496ED" }
  ],
  experience: "5+ years",
  company: "Tech Solutions Inc.",
  role: "Senior Full Stack Developer",
  joinedDate: "January 2024",
  rating: 4.8,
  totalSessions: 142,
  followers: 324,
  totalMentees: 45,
  specializations: ["Web Development", "Career Guidance", "Technical Interviews"],
  following: 12,
  completedSessions: 28,
  currentMentors: ["Manraj Singh", "DishavPreet Kaur", "Padampreet Singh"]
};

// Sample followers data
const followersData = [
  { id: 1, name: "Rohit Sharma", avatar: "RS", role: "Frontend Developer" },
  { id: 2, name: "Priya Patel", avatar: "PP", role: "Aspiring Developer" },
  { id: 3, name: "Arjun Gupta", avatar: "AG", role: "Data Scientist" },
  { id: 4, name: "Sneha Reddy", avatar: "SR", role: "Backend Developer" }
];

const FollowerCard = ({ follower }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    background: "#f8f9fa",
    borderRadius: "12px",
    border: "1px solid #e9ecef"
  }}>
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
      {follower.avatar}
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>{follower.name}</h4>
      <p style={{ margin: "0.25rem 0 0 0", color: "#6c757d", fontSize: "0.9rem" }}>{follower.role}</p>
    </div>
    <button style={{
      padding: "0.5rem 1rem",
      background: "#667eea",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "0.9rem"
    }}>
      View Profile
    </button>
  </div>
);

export default function ProfilePage() {
  const [user] = useState(sampleUserData);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);

  const getSkillLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "expert": return "#27ae60";
      case "advanced": return "#f39c12";
      case "intermediate": return "#3498db";
      case "beginner": return "#e74c3c";
      default: return "#95a5a6";
    }
  };

  return (
    <div style={{
      background: "#f5f7fa",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif"
    }}>
      <main style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem"
      }}>
        {/* Profile Header */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "2rem",
          marginBottom: "2rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e9ecef"
        }}>
          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
            {/* Avatar */}
            <div style={{
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "2.5rem",
              flexShrink: 0
            }}>
              {user.avatar}
            </div>

            {/* User Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "bold", color: "#2c3e50" }}>{user.name}</h1>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ color: "#6c757d", fontSize: "1rem" }}>📍 {user.location}</span>
                    <span style={{ color: "#6c757d", fontSize: "1rem" }}>💼 {user.role} at {user.company}</span>
                    <span style={{ color: "#6c757d", fontSize: "1rem" }}>📅 Joined {user.joinedDate}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: isEditing ? "#27ae60" : "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
                {user.userType === "mentor" ? (
                  <>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>{user.followers}</div>
                      <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Followers</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>{user.totalMentees}</div>
                      <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Mentees</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>{user.totalSessions}</div>
                      <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Sessions</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f39c12" }}>⭐ {user.rating}</div>
                      <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Rating</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>{user.following}</div>
                      <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Following</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>{user.completedSessions}</div>
                      <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Sessions</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>{user.currentMentors.length}</div>
                      <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>Mentors</div>
                    </div>
                  </>
                )}
              </div>

              {/* Bio */}
              <p style={{
                color: "#495057",
                lineHeight: "1.6",
                fontSize: "1rem",
                margin: 0
              }}>
                {user.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2rem",
          background: "#f8f9fa",
          padding: "0.5rem",
          borderRadius: "12px"
        }}>
          {["overview", "skills", user.userType === "mentor" ? "followers" : "following"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.75rem 1.5rem",
                background: activeTab === tab ? "#667eea" : "transparent",
                color: activeTab === tab ? "white" : "#6c757d",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
                textTransform: "capitalize",
                transition: "all 0.3s ease"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e9ecef",
          minHeight: "400px"
        }}>
          {activeTab === "overview" && (
            <div>
              <h2 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>
                {user.userType === "mentor" ? "Mentoring Overview" : "Learning Journey"}
              </h2>
              {user.userType === "mentor" ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
                  <div>
                    <h3 style={{ color: "#495057", marginBottom: "1rem" }}>Specializations</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {user.specializations.map((spec, index) => (
                        <span key={index} style={{
                          padding: "0.5rem 1rem",
                          background: "#e3f2fd",
                          color: "#1976d2",
                          borderRadius: "20px",
                          fontSize: "0.9rem",
                          fontWeight: "500"
                        }}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ color: "#495057", marginBottom: "1rem" }}>Recent Achievements</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>🏆</span>
                        <span>Top Mentor of the Month</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>⭐</span>
                        <span>100+ Five Star Reviews</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>🎯</span>
                        <span>Expert React Developer Badge</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
                  <div>
                    <h3 style={{ color: "#495057", marginBottom: "1rem" }}>Current Mentors</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {user.currentMentors.map((mentor, index) => (
                        <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span>👨‍💻</span>
                          <span>{mentor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ color: "#495057", marginBottom: "1rem" }}>Learning Goals</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>🎯</span>
                        <span>Master React Hooks</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>🚀</span>
                        <span>Build Full-Stack Projects</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>💼</span>
                        <span>Prepare for Senior Role</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              <h2 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>Technical Skills</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
                {user.skills.map((skill, index) => (
                  <div key={index} style={{
                    padding: "1.5rem",
                    background: "#f8f9fa",
                    borderRadius: "12px",
                    border: "1px solid #e9ecef"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <h3 style={{ margin: 0, color: skill.color, fontWeight: "600" }}>{skill.name}</h3>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        background: getSkillLevelColor(skill.level) + "20",
                        color: getSkillLevelColor(skill.level),
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: "600"
                      }}>
                        {skill.level}
                      </span>
                    </div>
                    <div style={{
                      width: "100%",
                      height: "8px",
                      background: "#e9ecef",
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: skill.level === "Expert" ? "100%" : 
                              skill.level === "Advanced" ? "80%" :
                              skill.level === "Intermediate" ? "60%" : "40%",
                        height: "100%",
                        background: getSkillLevelColor(skill.level),
                        borderRadius: "4px",
                        transition: "width 0.5s ease"
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === "followers" || activeTab === "following") && (
            <div>
              <h2 style={{ marginBottom: "1.5rem", color: "#2c3e50" }}>
                {user.userType === "mentor" ? "Followers" : "Following"} ({followersData.length})
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1rem" }}>
                {followersData.map((follower) => (
                  <FollowerCard key={follower.id} follower={follower} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}