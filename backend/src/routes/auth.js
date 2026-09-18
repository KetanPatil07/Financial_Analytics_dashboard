import jwt from "jsonwebtoken";
import { Router } from "express";
import { User } from "../models/User.js";

const router = Router();

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const user = await User.create({
      name,
      email,
      password,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
    });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || "").toLowerCase() });
    if (!user || !(await user.comparePassword(password || ""))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/profile", async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

export default router;
