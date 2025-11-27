import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Role
    role: {
      type: String,
      enum: ["mentor", "mentee", "admin"],
      default: "mentee",
    },

    // Academic Info
    year: {
      type: String,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year", "Other"],
      required: true,
    },
    branch: { type: String }, // ✅ new

    // Contact Info
    phone: { type: String }, // ✅ new
    address: { type: String }, // ✅ new

    // Professional Info
    resumeLink: { type: String }, // ✅ new
    profilePicture: { type: String }, // ✅ new (can store Cloudinary URL)
    bio: { type: String }, // ✅ new (short about section)

    // Mentor Stats
    skills: [String],
    interests: [String],
    achievements: String,
    rating: { type: Number, default: 0 },
    menteesHelped: { type: Number, default: 0 },
    verifiedMentor: { type: Boolean, default: false },
    // inside your userSchema fields:
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  },

  { timestamps: true }
);

// ✅ Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Compare password for login
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ✅ Indexes for faster queries
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ rating: -1, menteesHelped: -1 });

export default mongoose.model("User", userSchema);
