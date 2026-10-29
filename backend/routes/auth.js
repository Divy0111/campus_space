import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Create a JWT token
function makeToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
}

// Return safe user information without the password
function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    phone: user.phone
  };
}

// STUDENT SIGNUP
// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters."
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      department:
        typeof department === "string" ? department.trim() : "",
      phone: typeof phone === "string" ? phone.trim() : "",
      role: "student"
    });

    return res.status(201).json({
      success: true,
      message: "Account created. Please log in.",
      user: publicUser(user)
    });
  } catch (error) {
    console.error("Signup error:", error);

    // Handle duplicate email index errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Signup failed."
    });
  }
});

// STUDENT OR ADMIN LOGIN
// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, mode } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter your email and password."
      });
    }

    if (!["student", "admin"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Choose a login type."
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (
      !user ||
      !(await bcrypt.compare(password, user.password)) ||
      user.role !== mode
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or incorrect login type."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token: makeToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed."
    });
  }
});

// GET CURRENT LOGGED-IN USER
// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  return res.status(200).json({
    success: true,
    user: publicUser(req.user)
  });
});

export default router;
