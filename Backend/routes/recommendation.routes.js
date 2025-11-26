import express from "express";
import User from "../models/User.js";
import Interaction from "../models/Interaction.js";
import Review from "../models/Review.js";
import Community from "../models/Community.js";
import CommunityPost from "../models/CommunityPost.js";
import Request from "../models/Request.js";

const router = express.Router();

/**
 * Calculate cosine similarity between two arrays
 * @param {Array} vecA - First vector (array)
 * @param {Array} vecB - Second vector (array)
 * @returns {number} Cosine similarity (0-1)
 */
function cosineSimilarity(vecA, vecB) {
  // Create a set of all unique items
  const allItems = new Set([...vecA, ...vecB]);
  const arrA = Array.from(allItems).map(item => vecA.includes(item) ? 1 : 0);
  const arrB = Array.from(allItems).map(item => vecB.includes(item) ? 1 : 0);

  // Calculate dot product
  const dotProduct = arrA.reduce((sum, val, i) => sum + val * arrB[i], 0);

  // Calculate magnitudes
  const magnitudeA = Math.sqrt(arrA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(arrB.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

function normalizeTags(arr) {
  return (arr || [])
    .filter((v) => typeof v === "string")
    .map((v) => v.trim().toLowerCase());
}

/**
 * Calculate interaction score between mentee and mentor
 * @param {string} menteeId - Mentee user ID
 * @param {string} mentorId - Mentor user ID
 * @returns {Promise<number>} Interaction score (0-1)
 */
async function getInteractionScore(menteeId, mentorId) {
  try {
    const interactions = await Interaction.find({
      userId: menteeId,
      $or: [
        { targetId: mentorId },
        { type: "request_accepted", targetId: { $exists: true } }
      ]
    });

    // Count different interaction types with weights
    const weights = {
      chat_message: 0.15,
      chat_started: 0.20,
      request_accepted: 0.25,
      community_joined: 0.15,
      community_reacted: 0.10,
      community_posted: 0.10,
      request_sent: 0.05
    };

    let score = 0;
    interactions.forEach(interaction => {
      score += weights[interaction.type] || 0.05;
    });

    // Normalize to 0-1 range (max possible score is around 1.0)
    return Math.min(score, 1.0);
  } catch (err) {
    console.error("Error calculating interaction score:", err);
    return 0;
  }
}

/**
 * Calculate rating score based on reviews
 * @param {string} mentorId - Mentor user ID
 * @returns {Promise<{score: number, count: number, avgRating: number}>}
 */
async function getRatingScore(mentorId) {
  try {
    const reviews = await Review.find({ mentorId });
    
    if (reviews.length === 0) {
      return { score: 0, count: 0, avgRating: 0 };
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    // Normalize rating (0-5) to (0-1) and apply review count bonus
    const ratingScore = avgRating / 5;
    const reviewCountBonus = Math.min(reviews.length / 20, 0.2); // Max 20 reviews = 0.2 bonus
    const score = ratingScore * 0.8 + reviewCountBonus * 0.2;

    return { score: Math.min(score, 1.0), count: reviews.length, avgRating };
  } catch (err) {
    console.error("Error calculating rating score:", err);
    return { score: 0, count: 0, avgRating: 0 };
  }
}

/**
 * Calculate community activity score
 * @param {string} mentorId - Mentor user ID
 * @returns {Promise<number>} Activity score (0-1)
 */
async function getCommunityActivityScore(mentorId) {
  try {
    const [communities, posts, communitiesCreated] = await Promise.all([
      Community.countDocuments({ mentorId }),
      CommunityPost.countDocuments({ mentorId }),
      Community.countDocuments({ mentorId })
    ]);

    // Get total members across all communities created by mentor
    const allCommunities = await Community.find({ mentorId });
    const totalMembers = allCommunities.reduce((sum, comm) => sum + (comm.members?.length || 0), 0);

    // Calculate scores
    const communitiesScore = Math.min(communitiesCreated / 5, 1) * 0.3; // Max 5 communities
    const postsScore = Math.min(posts / 50, 1) * 0.4; // Max 50 posts
    const membersScore = Math.min(totalMembers / 100, 1) * 0.3; // Max 100 members

    return Math.min(communitiesScore + postsScore + membersScore, 1.0);
  } catch (err) {
    console.error("Error calculating community activity score:", err);
    return 0;
  }
}

/**
 * Calculate mentees helped score
 * @param {number} menteesHelped - Number of mentees helped
 * @returns {number} Normalized score (0-1)
 */
function getMenteesHelpedScore(menteesHelped) {
  // Normalize: 0 mentees = 0, 50+ mentees = 1.0
  return Math.min((menteesHelped || 0) / 50, 1.0);
}

/**
 * Check if mentee already has pending/accepted request with mentor
 * @param {string} menteeId - Mentee user ID
 * @param {string} mentorId - Mentor user ID
 * @returns {Promise<boolean>}
 */
async function hasExistingRequest(menteeId, mentorId) {
  try {
    const request = await Request.findOne({
      menteeId,
      mentorId,
      status: { $in: ["pending", "accepted"] }
    });
    return !!request;
  } catch (err) {
    return false;
  }
}

/**
 * GET recommendations for logged-in mentee
 * Query params:
 * - limit: number of recommendations (default: 10)
 * - minSimilarity: minimum similarity threshold (default: 0.1)
 */
router.get("/", async (req, res) => {
  try {
    const menteeId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    const minSimilarity = parseFloat(req.query.minSimilarity) || 0.1;

    // Get mentee info
    const mentee = await User.findById(menteeId);

    if (!mentee || mentee.role !== "mentee") {
      return res.status(403).json({ message: "Only mentees can get recommendations" });
    }

    // Get all mentors
    const mentors = await User.find({ role: "mentor" });

    if (mentors.length === 0) {
      return res.json([]);
    }

    // Calculate comprehensive scores for each mentor
    const recommendations = await Promise.all(
      mentors.map(async (mentor) => {
        // 1. Cosine Similarity (Skills/Interests matching) - Weight: 30%
        const similarity = cosineSimilarity(
          normalizeTags(mentee.interests || []),
          normalizeTags(mentor.skills || [])
        );

        // Skip mentors with very low similarity
        if (similarity < minSimilarity) {
          return null;
        }

        // 2. Interaction Score - Weight: 15%
        const interactionScore = await getInteractionScore(menteeId, mentor._id.toString());

        // 3. Rating Score - Weight: 25%
        const ratingData = await getRatingScore(mentor._id.toString());

        // 4. Mentees Helped Score - Weight: 15%
        const menteesHelpedScore = getMenteesHelpedScore(mentor.menteesHelped || 0);

        // 5. Community Activity Score - Weight: 15%
        const communityActivityScore = await getCommunityActivityScore(mentor._id.toString());

        // Calculate weighted final score
        const finalScore =
          similarity * 0.30 +
          interactionScore * 0.15 +
          ratingData.score * 0.25 +
          menteesHelpedScore * 0.15 +
          communityActivityScore * 0.15;

        // Check if there's an existing request
        const hasRequest = await hasExistingRequest(menteeId, mentor._id.toString());

        return {
          mentorId: mentor._id,
          name: mentor.name,
          email: mentor.email,
          skills: mentor.skills || [],
          interests: mentor.interests || [],
          bio: mentor.bio,
          profilePicture: mentor.profilePicture,
          branch: mentor.branch,
          year: mentor.year,
          verifiedMentor: mentor.verifiedMentor || false,
          
          // Scores
          finalScore: parseFloat(finalScore.toFixed(4)),
          similarity: parseFloat(similarity.toFixed(4)),
          interactionScore: parseFloat(interactionScore.toFixed(4)),
          ratingScore: parseFloat(ratingData.score.toFixed(4)),
          menteesHelpedScore: parseFloat(menteesHelpedScore.toFixed(4)),
          communityActivityScore: parseFloat(communityActivityScore.toFixed(4)),
          
          // Metrics
          rating: mentor.rating || 0,
          avgRating: parseFloat(ratingData.avgRating.toFixed(2)),
          reviewCount: ratingData.count,
          menteesHelped: mentor.menteesHelped || 0,
          
          // Status
          hasExistingRequest,
          
          // Matching skills
          matchingSkills: (mentee.interests || []).filter((interest) => {
            const ms = new Set(normalizeTags(mentor.skills || []));
            return ms.has(String(interest).trim().toLowerCase());
          })
        };
      })
    );

    // Filter out null recommendations and sort by final score
    const validRecommendations = recommendations
      .filter(rec => rec !== null)
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit);

    res.json({
      recommendations: validRecommendations,
      count: validRecommendations.length,
      algorithm: "advanced_cosine_similarity_v2",
      weights: {
        similarity: 30,
        interactions: 15,
        ratings: 25,
        menteesHelped: 15,
        communityActivity: 15
      }
    });
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;