// Backend/middleware/auth.js
import jwt from "jsonwebtoken";

export const auth = () => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
      req.user = decoded; // { id, role, iat, exp }
      next();
    } catch (err) {
      console.error("Auth middleware error:", err.message);
      res.status(401).json({ message: "Token is not valid or expired" });
    }
  };
};
