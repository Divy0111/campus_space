
// const express = require("express");
// const router = express.Router();

// const rooms = [
//   {
//     id: "library",
//     name: "Central Library",
//     capacity: 100,
//     equipment: ["Projector", "Wi-Fi", "Study tables"],
//     description: "A quiet space for academic meetings and study events."
//   },
//   {
//     id: "block1",
//     name: "Block 1",
//     capacity: 60,
//     equipment: ["Projector", "Whiteboard"],
//     description: "Suitable for classes, seminars and club meetings."
//   },
//   {
//     id: "block2",
//     name: "Block 2",
//     capacity: 80,
//     equipment: ["Projector", "Wi-Fi"],
//     description: "A flexible space for workshops and presentations."
//   },
//   {
//     id: "block3",
//     name: "Block 3",
//     capacity: 50,
//     equipment: ["Whiteboard", "Wi-Fi"],
//     description: "A convenient space for group activities."
//   },
//   {
//     id: "block4",
//     name: "Block 4",
//     capacity: 120,
//     equipment: ["Projector", "Audio system"],
//     description: "A larger space for events and guest lectures."
//   }
// ];

// router.get("/", (req, res) => {
//   res.json({ rooms });
// });

// module.exports = router;








import express from "express";
import mongoose from "mongoose";
import Room from "../models/Room.js";

const router = express.Router();

// GET all active rooms, optionally filtered by building
// Example: GET /rooms?building=Central%20Library
router.get("/", async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.building) {
      const allowedBuildings = [
        "Central Library",
        "Block 1",
        "Block 2",
        "Block 3",
        "Block 4"
      ];

      if (!allowedBuildings.includes(req.query.building)) {
        return res.status(400).json({
          message: "Invalid building name."
        });
      }

      filter.building = req.query.building;
    }

    const rooms = await Room.find(filter)
      .sort({ building: 1, name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    console.error("Get rooms error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch rooms."
    });
  }
});

// GET one individual room by MongoDB ID
// Example: GET /rooms/yourRoomMongoId
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID."
      });
    }

    const room = await Room.findOne({
      _id: req.params.id,
      isActive: true
    }).lean();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found or inactive."
      });
    }

    return res.status(200).json({
      success: true,
      room
    });
  } catch (error) {
    console.error("Get room error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch room details."
    });
  }
});

export default router;
