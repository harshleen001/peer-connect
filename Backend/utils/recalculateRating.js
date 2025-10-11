// utils/recalculateRating.js
import Review from "../models/Review.js";
import User from "../models/User.js";

export const recalculateRating = async (mentorId) => {
  const reviews = await Review.find({ mentorId });
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  await User.findByIdAndUpdate(mentorId, { rating: avgRating });
};
