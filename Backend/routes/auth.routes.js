// Backend/routes/auth.routes.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { upload } from "../middleware/upload.js";

const router = Router();

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ✅ Register

// ===============================
// ✅ REGISTER ROUTE
// ===============================
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      year,
      branch,
      phone,
      address,
      resumeLink,
      profilePicture,
      bio,
      skills,
      interests,
      achievements,
      careerGoals,
      learningObjectives,
      mentorAbout,
      certificates,
    } = req.body;

    // 🧩 Validation
    if (!name || !email || !password || !year) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // 🧠 Check if email exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

   

    // 🧾 Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      year,
      branch,
      phone,
      address,
      resumeLink,
      profilePicture,
      bio,
      skills,
      interests,
      achievements,
      careerGoals,
      learningObjectives,
      mentorAbout,
      certificates,
    });

    // 🪪 Generate token
    const token = signToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Admin-only login
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const token = signToken(user);

    res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
export default router;

// Upload certificate or profile file
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const fileUrl = `/api/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
 