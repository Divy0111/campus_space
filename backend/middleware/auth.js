
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// async function protect(req, res, next) {
//   try {
//     const header = req.headers.authorization || "";
//     const token = header.startsWith("Bearer ")
//       ? header.slice(7)
//       : null;

//     if (!token) {
//       return res.status(401).json({
//         message: "Please log in first."
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);

//     if (!user) {
//       return res.status(401).json({
//         message: "Account not found."
//       });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       message: "Invalid or expired login session."
//     });
//   }
// }

// function adminOnly(req, res, next) {
//   if (req.user && req.user.role === "admin") {
//     return next();
//   }

//   return res.status(403).json({
//     message: "Admin access required."
//   });
// }

// module.exports = { protect, adminOnly };






import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes that require a logged-in user
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in first."
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from the .env file.");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid login token."
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account not found."
      });
    }

    // Make the authenticated user available to route handlers
    req.user = user;

    return next();
  } catch (error) {
    if (error.name !== "JsonWebTokenError" &&
        error.name !== "TokenExpiredError") {
      console.error("Authentication error:", error.message);
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session."
    });
  }
}

// Restrict routes to administrators
export function adminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Admin access required."
  });
}
