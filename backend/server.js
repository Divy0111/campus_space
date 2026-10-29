
// require("dotenv").config();

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const authRoutes = require("./routes/auth");
// const roomRoutes = require("./routes/rooms");
// const bookingRoutes = require("./routes/bookings");

// const app = express();

// app.use(cors({ origin: "http://localhost:3000" }));
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.json({ message: "CampusSpace API is running." });
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/rooms", roomRoutes);
// app.use("/api/bookings", bookingRoutes);

// const PORT = process.env.PORT || 5000;

// async function startServer() {
//   try {
//     if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
//       throw new Error("MONGO_URI and JWT_SECRET must be configured.");
//     }

//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("MongoDB connected successfully.");

//     app.listen(PORT, () => {
//       console.log(`CampusSpace API running at http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error("Server startup failed:", error.message);
//     process.exit(1);
//   }
// }

// startServer();





import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import bookingRoutes from "./routes/bookings.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000"
  })
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusSpace API is running."
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Room routes
app.use("/api/rooms", roomRoutes);

// Booking routes
app.use("/api/bookings", bookingRoutes);

// Handle unknown API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Handle unexpected errors
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      err.status && err.status < 500
        ? err.message
        : "An internal server error occurred."
  });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
      throw new Error(
        "MONGO_URI and JWT_SECRET must be configured in the .env file."
      );
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(
        `CampusSpace API running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
