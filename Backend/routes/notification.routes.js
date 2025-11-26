import express from "express";
import Notification from "../models/Notification.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * ✅ Get notifications for logged-in user (with pagination + filters)
 * Example: /api/notifications?page=2&limit=5&type=community&isRead=false
 */
router.get("/", auth(), async (req, res) => {
  try {
    const { page = 1, limit = 10, type, isRead } = req.query;
    const filter = { userId: req.user.id };

    // Optional filters
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === "true";

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Notification.countDocuments(filter);

    res.json({
      page: Number(page),
      limit: Number(limit),
      totalNotifications: total,
      totalPages: Math.ceil(total / limit),
      notifications,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Mark a notification as read
 */
router.patch("/:id/read", auth(), async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: "Not found" });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get unread community notifications count
router.get("/community/unread", auth(), async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      type: "community",
      isRead: false
    });

    res.json({ unreadCommunityNotifications: count });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ✅ Mark all community notifications as read
 */
router.patch("/community/mark-read", auth(), async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, type: "community", isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All community notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ✅ Clear all notifications for logged-in user
 * (Deletes all notifications belonging to them)
 */
router.delete("/clear", auth(), async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ message: "All notifications cleared successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ✅ Delete a single notification
 */
router.delete("/:id", auth(), async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


export default router;
