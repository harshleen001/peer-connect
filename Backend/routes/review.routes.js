import express from "express";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

/**
 * POST /api/reviews
 * Create a review for a mentor (mentee only)
 */
router.post("/", auth(), async (req, res) => {
  try {
    const { mentorId, rating, comment } = req.body;

    if (req.user.role !== "mentee") {
      return res.status(403).json({ message: "Only mentees can give reviews" });
    }
   
    const review = new Review({
      mentorId,
      menteeId: req.user.id,
      rating,
      comment,
    });
    await review.save();

    // ✅ recalc avg rating
    const reviews = await Review.find({ mentorId });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await User.findByIdAndUpdate(mentorId, { rating: avgRating });

    // ✅ increment menteesHelped if first review from this mentee
    const existingReviews = await Review.find({ mentorId, menteeId: req.user.id });
    if (existingReviews.length === 1) {
      await User.findByIdAndUpdate(mentorId, { $inc: { menteesHelped: 1 } });
    }

    // ✅ create notification for the mentor
    const notification = new Notification({
      userId: mentorId,
      message: `${req.user.id} gave you a ${rating}-star review`,
      type: "rating",
      link: `/mentor/${mentorId}`,
    });
    await notification.save();

    res.json({ message: "Review added and mentor notified", review });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * GET /api/reviews/:mentorId
 * Fetch all reviews for a mentor
 */
router.get("/:mentorId", async (req, res) => {
  try {
    const { mentorId } = req.params;

    const reviews = await Review.find({ mentorId })
      .populate("menteeId", "name year")
      .sort({ timestamp: -1 });

    res.json({
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * DELETE /api/reviews/:id
 * Delete a review (only the mentee who wrote it)
 */
router.delete("/:id", auth(), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.menteeId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    const mentorId = review.mentorId;

    await review.deleteOne();

    // ✅ recalc rating after deletion
    const reviews = await Review.find({ mentorId });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await User.findByIdAndUpdate(mentorId, { rating: avgRating });

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * PATCH /api/reviews/:id
 * Update a review (only the mentee who wrote it)
 */
router.patch("/:id", auth(), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.menteeId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this review" });
    }

    const { rating, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    // ✅ recalc rating after update
    const reviews = await Review.find({ mentorId: review.mentorId });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await User.findByIdAndUpdate(review.mentorId, { rating: avgRating });

    res.json({ message: "Review updated successfully", review });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
