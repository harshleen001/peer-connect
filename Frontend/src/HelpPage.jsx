import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HelpPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I connect with a mentor?",
      answer: "To connect with a mentor, browse the recommended mentors on your dashboard or use the 'View more' link to see all available mentors. Click on a mentor's profile to view their details, then click the 'Send Request' button. Once the mentor accepts your request, you'll be able to start chatting with them directly."
    },
    {
      id: 2,
      question: "How do I send or accept connection requests?",
      answer: "As a mentee, you can send connection requests by clicking 'Send Request' on any mentor's profile. As a mentor, you'll receive notifications when mentees send you requests. You can view incoming requests on your dashboard and accept or reject them directly from the notifications or requests page. Once accepted, both parties can start messaging."
    },
    {
      id: 3,
      question: "How do I join community chats?",
      answer: "You can join community chats by browsing the trending communities on your dashboard. Click the 'Join' button on any community you're interested in. Once joined, you'll see posts from mentors in that community and can interact with the content. You can also create your own community if you're a mentor."
    },
    {
      id: 4,
      question: "What happens when I send feedback?",
      answer: "When you send feedback through the 'Send Feedback' option in the menu, your comments are submitted to our team. We review all feedback regularly to improve the platform. You may receive a response if you include your contact information, and your feedback helps us prioritize new features and fixes."
    },
    {
      id: 5,
      question: "I forgot my password; what do I do?",
      answer: "If you've forgotten your password, please contact our support team using the 'Contact Support' link below. Our support team will help you reset your password securely. Make sure to provide your registered email address when contacting support."
    },
    {
      id: 6,
      question: "How do I update my profile?",
      answer: "To update your profile, navigate to the 'Profile' page from the navigation bar. Click on the 'Edit Profile' button to modify your information, including your name, bio, skills, profile picture, and other details. Remember to save your changes before leaving the page."
    },
    {
      id: 7,
      question: "Is my chat data private?",
      answer: "Yes, your chat data is private and secure. All messages are encrypted and only visible to you and the person you're chatting with. We follow industry-standard security practices to protect your data. Your conversations are not shared with third parties, and only you and your chat partner can access your messages."
    },
    {
      id: 8,
      question: "Who can view my profile?",
      answer: "Your profile is visible to all registered users on the platform, including mentors and mentees. However, sensitive information like your email address is kept private. You can control what information is displayed on your public profile through the profile settings. Other users can view your name, bio, skills, ratings, and public achievements."
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 style={{ 
          fontSize: "2.5rem", 
          fontWeight: "bold", 
          color: "#2c3e50",
          marginBottom: "0.5rem"
        }}>
          Help & Support
        </h1>
        <p style={{ 
          fontSize: "1.1rem", 
          color: "#64748b",
          margin: 0
        }}>
          Find answers to common questions and get the support you need
        </p>
      </div>

      {/* General Help Section */}
      <section style={{ 
        background: "white", 
        borderRadius: "16px", 
        padding: "2rem", 
        marginBottom: "2rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #e9ecef"
      }}>
        <h2 style={{ 
          fontSize: "1.8rem", 
          fontWeight: "600", 
          color: "#2c3e50",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          <span>📚</span> General Help
        </h2>
        <div style={{ 
          fontSize: "1rem", 
          color: "#475569",
          lineHeight: "1.7"
        }}>
          <p style={{ marginBottom: "1rem" }}>
            Welcome to the Mentorship Platform! This platform connects mentees with experienced mentors 
            to facilitate learning, growth, and professional development.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            <strong>Getting Started:</strong> As a mentee, you can browse and connect with mentors, join 
            community chats, and participate in discussions. As a mentor, you can accept connection requests, 
            create communities, and share your knowledge through posts and direct messaging.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            <strong>Key Features:</strong>
          </p>
          <ul style={{ 
            marginLeft: "1.5rem", 
            marginBottom: "1rem",
            lineHeight: "2"
          }}>
            <li>Connect with mentors through connection requests</li>
            <li>Real-time messaging with your connections</li>
            <li>Join or create community chats</li>
            <li>View leaderboards and track achievements</li>
            <li>Receive notifications for important updates</li>
            <li>Rate and review mentors</li>
          </ul>
          <p>
            If you need additional assistance, please use the Contact Support option below or refer to the 
            FAQs section for answers to common questions.
          </p>
        </div>
      </section>

      {/* FAQs Section */}
      <section style={{ 
        background: "white", 
        borderRadius: "16px", 
        padding: "2rem", 
        marginBottom: "2rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #e9ecef"
      }}>
        <h2 style={{ 
          fontSize: "1.8rem", 
          fontWeight: "600", 
          color: "#2c3e50",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          <span>❓</span> Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {faqs.map((faq) => (
            <div
              key={faq.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                overflow: "hidden",
                transition: "all 0.3s ease",
                background: openFaq === faq.id ? "#f8f9fa" : "white"
              }}
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                style={{
                  width: "100%",
                  padding: "1.25rem 1.5rem",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (openFaq !== faq.id) {
                    e.currentTarget.style.background = "#f8f9fa";
                  }
                }}
                onMouseLeave={(e) => {
                  if (openFaq !== faq.id) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span style={{ 
                  fontSize: "1.1rem", 
                  fontWeight: "600", 
                  color: "#2c3e50",
                  flex: 1
                }}>
                  {faq.question}
                </span>
                <span style={{ 
                  fontSize: "1.5rem", 
                  color: "#667eea",
                  transition: "transform 0.3s ease",
                  transform: openFaq === faq.id ? "rotate(180deg)" : "rotate(0deg)"
                }}>
                  ▼
                </span>
              </button>
              {openFaq === faq.id && (
                <div style={{
                  padding: "0 1.5rem 1.25rem 1.5rem",
                  color: "#475569",
                  lineHeight: "1.7",
                  fontSize: "1rem",
                  animation: "fadeIn 0.3s ease"
                }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support Section */}
      <section style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
        borderRadius: "16px", 
        padding: "2.5rem", 
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
      }}>
        <h2 style={{ 
          fontSize: "1.8rem", 
          fontWeight: "600", 
          color: "white",
          marginBottom: "1rem"
        }}>
          Still Need Help?
        </h2>
        <p style={{ 
          fontSize: "1.1rem", 
          color: "rgba(255,255,255,0.9)",
          marginBottom: "2rem",
          lineHeight: "1.7"
        }}>
          Our support team is here to assist you with any questions or issues you may have. 
          Don't hesitate to reach out!
        </p>
        <button
          onClick={() => {
            // You can replace this with actual contact support functionality
            window.location.href = "mailto:support@mentorshipplatform.com?subject=Support Request";
          }}
          style={{
            padding: "1rem 2.5rem",
            background: "white",
            color: "#667eea",
            border: "none",
            borderRadius: "25px",
            fontSize: "1.1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
          }}
        >
          📧 Contact Support
        </button>
        <div style={{ 
          marginTop: "2rem", 
          paddingTop: "2rem",
          borderTop: "1px solid rgba(255,255,255,0.2)"
        }}>
          <p style={{ 
            color: "rgba(255,255,255,0.9)",
            marginBottom: "0.5rem",
            fontSize: "0.95rem"
          }}>
            <strong>Email:</strong> support@mentorshipplatform.com
          </p>
          <p style={{ 
            color: "rgba(255,255,255,0.9)",
            margin: 0,
            fontSize: "0.95rem"
          }}>
            <strong>Response Time:</strong> We typically respond within 24-48 hours
          </p>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}

