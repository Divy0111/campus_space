import express from "express";
import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// -------------------- HELPERS --------------------

const validTime = (value) =>
  typeof value === "string" &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

function getTodayIndia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function validDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function getAuthenticatedUserId(req) {
  const user = req.user;

  if (!user) return null;

  const id = user._id ?? user.id ?? user.userId ?? user.sub;

  if (!id) return null;

  const value = String(id);

  return mongoose.isValidObjectId(value) ? value : null;
}

function populateBooking(query) {
  return query
    .populate("user", "name email department")
    .populate("room", "name building capacity location");
}

function sendError(res, error, fallbackMessage) {
  console.error(fallbackMessage, error);

  if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage
  });
}

// -------------------- CREATE BOOKING --------------------
// POST /api/bookings

router.post("/", protect, async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid login session. Please log in again."
      });
    }

    const body = req.body || {};

    const roomId = body.roomId || body.room;

    const date =
      typeof body.date === "string" ? body.date.trim() : "";

    const startTime =
      typeof body.startTime === "string"
        ? body.startTime.trim()
        : "";

    const endTime =
      typeof body.endTime === "string"
        ? body.endTime.trim()
        : "";

    const purpose =
      typeof body.purpose === "string"
        ? body.purpose.trim()
        : "";

    const attendees =
      body.attendees === "" || body.attendees == null
        ? NaN
        : Number(body.attendees);

    const errors = [];

    if (
      typeof roomId !== "string" ||
      !mongoose.isValidObjectId(roomId)
    ) {
      errors.push("A valid room ID is required.");
    }

    if (!validDate(date)) {
      errors.push("Enter a valid booking date.");
    }

    if (!validTime(startTime)) {
      errors.push("Enter a valid start time.");
    }

    if (!validTime(endTime)) {
      errors.push("Enter a valid end time.");
    }

    if (
      validTime(startTime) &&
      validTime(endTime) &&
      startTime >= endTime
    ) {
      errors.push("End time must be later than start time.");
    }

    if (purpose.length < 3 || purpose.length > 500) {
      errors.push("Purpose must contain 3 to 500 characters.");
    }

    if (!Number.isSafeInteger(attendees) || attendees < 1) {
      errors.push("Attendees must be a positive whole number.");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking details.",
        errors
      });
    }

    if (date < getTodayIndia()) {
      return res.status(400).json({
        success: false,
        message: "Bookings cannot be made for past dates."
      });
    }

    const selectedRoom = await Room.findOne({
      _id: roomId,
      isActive: true
    });

    if (!selectedRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found or currently unavailable."
      });
    }

    if (attendees > Number(selectedRoom.capacity)) {
      return res.status(400).json({
        success: false,
        message: `This room can accommodate up to ${selectedRoom.capacity} people.`
      });
    }

    const conflict = await Booking.findOne({
      room: selectedRoom._id,
      date,
      status: { $in: ["pending", "approved"] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message:
          "This room already has a booking or pending request during that time."
      });
    }

    const booking = await Booking.create({
      user: userId,
      room: selectedRoom._id,
      date,
      startTime,
      endTime,
      purpose,
      attendees,
      status: "pending"
    });

    const result = await populateBooking(
      Booking.findById(booking._id)
    );

    return res.status(201).json({
      success: true,
      message: "Booking request submitted for admin approval.",
      booking: result
    });
  } catch (error) {
    return sendError(res, error, "Could not create booking.");
  }
});

// -------------------- GET BOOKINGS --------------------
// GET /api/bookings

router.get("/", protect, async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid login session. Please log in again."
      });
    }

    const filter =
      req.user?.role === "admin"
        ? {}
        : { user: userId };

    const bookings = await populateBooking(
      Booking.find(filter)
    ).sort({ date: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    return sendError(res, error, "Could not load bookings.");
  }
});

// -------------------- ADMIN APPROVE OR REJECT --------------------
// PATCH /api/bookings/:id/status

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;
      const status = req.body?.status;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking ID."
        });
      }

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be approved or rejected."
        });
      }

      const booking = await Booking.findById(id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found."
        });
      }

      if (booking.status !== "pending") {
        return res.status(409).json({
          success: false,
          message:
            `This booking is already ${booking.status}. Only pending bookings can be reviewed.`
        });
      }

      if (status === "approved") {
        const conflict = await Booking.findOne({
          _id: { $ne: booking._id },
          room: booking.room,
          date: booking.date,
          status: "approved",
          startTime: { $lt: booking.endTime },
          endTime: { $gt: booking.startTime }
        });

        if (conflict) {
          return res.status(409).json({
            success: false,
            message:
              "Another booking has already been approved for this room and time."
          });
        }
      }

      const updatedBooking = await Booking.findOneAndUpdate(
        {
          _id: id,
          status: "pending"
        },
        {
          $set: { status }
        },
        {
          new: true,
          runValidators: true
        }
      );

      if (!updatedBooking) {
        return res.status(409).json({
          success: false,
          message:
            "This booking was already reviewed. Refresh the booking list."
        });
      }

      const result = await populateBooking(
        Booking.findById(updatedBooking._id)
      );

      return res.status(200).json({
        success: true,
        message: `Booking ${status} successfully.`,
        booking: result
      });
    } catch (error) {
      return sendError(
        res,
        error,
        "Could not update booking status."
      );
    }
  }
);

// -------------------- CANCEL BOOKING --------------------
// PATCH /api/bookings/:id/cancel

router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID."
      });
    }

    const userId = getAuthenticatedUserId(req);

    if (!userId && req.user?.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Invalid login session. Please log in again."
      });
    }

    // Load the original booking without populating or modifying its room.
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found."
      });
    }

    const ownerId = String(booking.user);
    const isOwner = userId && ownerId === userId;
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this booking."
      });
    }

    if (!["pending", "approved"].includes(booking.status)) {
      return res.status(409).json({
        success: false,
        message: "This booking cannot be cancelled."
      });
    }

    // IMPORTANT:
    // Update only the status field.
    // Never assign a room name to booking.room.
    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: id,
        status: booking.status,
        user: booking.user
      },
      {
        $set: {
          status: "cancelled"
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedBooking) {
      return res.status(409).json({
        success: false,
        message:
          "The booking changed before it could be cancelled. Refresh and try again."
      });
    }

    const result = await populateBooking(
      Booking.findById(updatedBooking._id)
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking: result
    });
  } catch (error) {
    return sendError(res, error, "Could not cancel booking.");
  }
});

export default router;




// import express from "express";
// import mongoose from "mongoose";

// import Booking from "../models/Booking.js";
// import Room from "../models/Room.js";
// import { protect, adminOnly } from "../middleware/auth.js";

// const router = express.Router();

// // --------------------------------------------------
// // HELPERS
// // --------------------------------------------------

// const validTime = (value) =>
//   typeof value === "string" &&
//   /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

// function getTodayIndia() {
//   const parts = new Intl.DateTimeFormat("en-CA", {
//     timeZone: "Asia/Kolkata",
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit"
//   }).formatToParts(new Date());

//   const values = Object.fromEntries(
//     parts.map((part) => [part.type, part.value])
//   );

//   return `${values.year}-${values.month}-${values.day}`;
// }

// function validDate(value) {
//   if (
//     typeof value !== "string" ||
//     !/^\d{4}-\d{2}-\d{2}$/.test(value)
//   ) {
//     return false;
//   }

//   const [year, month, day] = value.split("-").map(Number);
//   const parsed = new Date(Date.UTC(year, month - 1, day));

//   return (
//     parsed.getUTCFullYear() === year &&
//     parsed.getUTCMonth() === month - 1 &&
//     parsed.getUTCDate() === day
//   );
// }

// function getAuthenticatedUserId(req) {
//   const user = req.user;

//   if (!user) return null;

//   const id = user._id ?? user.id ?? user.userId ?? user.sub;

//   if (!id) return null;

//   const value = String(id);

//   return mongoose.isValidObjectId(value) ? value : null;
// }

// function populateBooking(query) {
//   return query
//     .populate("user", "name email department")
//     .populate("room", "name building capacity location");
// }

// function sendError(res, error, fallbackMessage) {
//   console.error(fallbackMessage, error);

//   if (
//     error.name === "ValidationError" ||
//     error.name === "CastError"
//   ) {
//     return res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }

//   return res.status(500).json({
//     success: false,
//     message: fallbackMessage
//   });
// }

// // Identify which administrator is making a decision.
// // Configure these email addresses in backend/.env.
// function getAdminSlot(req) {
//   const email = String(req.user?.email || "")
//     .trim()
//     .toLowerCase();

//   const admin1Email = String(process.env.ADMIN1_EMAIL || "")
//     .trim()
//     .toLowerCase();

//   const admin2Email = String(process.env.ADMIN2_EMAIL || "")
//     .trim()
//     .toLowerCase();

//   if (!admin1Email || !admin2Email) {
//     return null;
//   }

//   if (admin1Email === admin2Email) {
//     return null;
//   }

//   if (email === admin1Email) {
//     return "admin1Decision";
//   }

//   if (email === admin2Email) {
//     return "admin2Decision";
//   }

//   return null;
// }

// function getDecisionLabel(slot) {
//   return slot === "admin1Decision" ? "Admin 1" : "Admin 2";
// }

// // --------------------------------------------------
// // CREATE BOOKING
// // POST /api/bookings
// // --------------------------------------------------

// router.post("/", protect, async (req, res) => {
//   try {
//     const userId = getAuthenticatedUserId(req);

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid login session. Please log in again."
//       });
//     }

//     const body = req.body || {};
//     const roomId = body.roomId || body.room;

//     const date =
//       typeof body.date === "string" ? body.date.trim() : "";

//     const startTime =
//       typeof body.startTime === "string"
//         ? body.startTime.trim()
//         : "";

//     const endTime =
//       typeof body.endTime === "string"
//         ? body.endTime.trim()
//         : "";

//     const purpose =
//       typeof body.purpose === "string"
//         ? body.purpose.trim()
//         : "";

//     const attendees =
//       body.attendees === "" || body.attendees == null
//         ? NaN
//         : Number(body.attendees);

//     const errors = [];

//     if (
//       typeof roomId !== "string" ||
//       !mongoose.isValidObjectId(roomId)
//     ) {
//       errors.push("A valid room ID is required.");
//     }

//     if (!validDate(date)) {
//       errors.push("Enter a valid booking date.");
//     }

//     if (!validTime(startTime)) {
//       errors.push("Enter a valid start time.");
//     }

//     if (!validTime(endTime)) {
//       errors.push("Enter a valid end time.");
//     }

//     if (
//       validTime(startTime) &&
//       validTime(endTime) &&
//       startTime >= endTime
//     ) {
//       errors.push("End time must be later than start time.");
//     }

//     if (purpose.length < 3 || purpose.length > 500) {
//       errors.push("Purpose must contain 3 to 500 characters.");
//     }

//     if (!Number.isSafeInteger(attendees) || attendees < 1) {
//       errors.push("Attendees must be a positive whole number.");
//     }

//     if (errors.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid booking details.",
//         errors
//       });
//     }

//     if (date < getTodayIndia()) {
//       return res.status(400).json({
//         success: false,
//         message: "Bookings cannot be made for past dates."
//       });
//     }

//     const selectedRoom = await Room.findOne({
//       _id: roomId,
//       isActive: true
//     });

//     if (!selectedRoom) {
//       return res.status(404).json({
//         success: false,
//         message: "Room not found or currently unavailable."
//       });
//     }

//     if (attendees > Number(selectedRoom.capacity)) {
//       return res.status(400).json({
//         success: false,
//         message: `This room can accommodate up to ${selectedRoom.capacity} people.`
//       });
//     }

//     // Pending and approved bookings both reserve the time slot.
//     const conflict = await Booking.findOne({
//       room: selectedRoom._id,
//       date,
//       status: { $in: ["pending", "approved"] },
//       startTime: { $lt: endTime },
//       endTime: { $gt: startTime }
//     });

//     if (conflict) {
//       return res.status(409).json({
//         success: false,
//         message:
//           "This room already has a booking or pending request during that time."
//       });
//     }

//     const booking = await Booking.create({
//       user: userId,
//       room: selectedRoom._id,
//       date,
//       startTime,
//       endTime,
//       purpose,
//       attendees,
//       status: "pending",
//       admin1Decision: { status: "pending" },
//       admin2Decision: { status: "pending" }
//     });

//     const result = await populateBooking(
//       Booking.findById(booking._id)
//     );

//     return res.status(201).json({
//       success: true,
//       message: "Booking request submitted for approval by both admins.",
//       booking: result
//     });
//   } catch (error) {
//     return sendError(res, error, "Could not create booking.");
//   }
// });

// // --------------------------------------------------
// // GET BOOKINGS
// // GET /api/bookings
// // Both admins see all bookings.
// // Students see only their own bookings.
// // --------------------------------------------------

// router.get("/", protect, async (req, res) => {
//   try {
//     const userId = getAuthenticatedUserId(req);

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid login session. Please log in again."
//       });
//     }

//     const filter =
//       req.user?.role === "admin"
//         ? {}
//         : { user: userId };

//     const bookings = await populateBooking(
//       Booking.find(filter)
//     ).sort({ date: 1, startTime: 1 });

//     return res.status(200).json({
//       success: true,
//       count: bookings.length,
//       bookings
//     });
//   } catch (error) {
//     return sendError(res, error, "Could not load bookings.");
//   }
// });

// // --------------------------------------------------
// // ADMIN DECISION
// // PATCH /api/bookings/:id/status
// //
// // Body: { "status": "approved" }
// //    or { "status": "rejected" }
// //    or { "status": "cancelled" }
// //
// // Each administrator can record their own decision.
// // Overall status becomes approved only after BOTH approve.
// // A rejection or cancellation immediately becomes final.
// // --------------------------------------------------

// router.patch(
//   "/:id/status",
//   protect,
//   adminOnly,
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const status = req.body?.status;

//       if (!mongoose.isValidObjectId(id)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid booking ID."
//         });
//       }

//       if (!["approved", "rejected", "cancelled"].includes(status)) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Status must be approved, rejected, or cancelled."
//         });
//       }

//       const slot = getAdminSlot(req);

//       if (!slot) {
//         return res.status(403).json({
//           success: false,
//           message:
//             "Your admin email is not configured as Admin 1 or Admin 2. Check ADMIN1_EMAIL and ADMIN2_EMAIL in backend/.env."
//         });
//       }

//       const booking = await Booking.findById(id);

//       if (!booking) {
//         return res.status(404).json({
//           success: false,
//           message: "Booking not found."
//         });
//       }

//       if (booking.status !== "pending") {
//         return res.status(409).json({
//           success: false,
//           message: `This booking is already ${booking.status}.`
//         });
//       }

//       // Prevent the same administrator from deciding twice.
//       // The other administrator may still decide if the booking
//       // remains pending after the first approval.
//       const currentDecision = booking.get(slot);

//       if (currentDecision?.status !== "pending") {
//         return res.status(409).json({
//           success: false,
//           message:
//             `${getDecisionLabel(slot)} has already recorded a decision for this booking.`
//         });
//       }

//       // An approved booking must not conflict with another
//       // already-approved booking in the same room and time.
//       if (status === "approved") {
//         const conflict = await Booking.findOne({
//           _id: { $ne: booking._id },
//           room: booking.room,
//           date: booking.date,
//           status: "approved",
//           startTime: { $lt: booking.endTime },
//           endTime: { $gt: booking.startTime }
//         });

//         if (conflict) {
//           return res.status(409).json({
//             success: false,
//             message:
//               "Another booking has already been approved for this room and time."
//           });
//         }
//       }

//       const now = new Date();
//       const adminEmail = String(req.user?.email || "").trim();

//       // Record this admin's decision only if their decision
//       // is still pending and the overall booking is pending.
//       const updatedBooking = await Booking.findOneAndUpdate(
//         {
//           _id: id,
//           status: "pending",
//           [`${slot}.status`]: "pending"
//         },
//         {
//           $set: {
//             [`${slot}.status`]: status,
//             [`${slot}.decidedAt`]: now,
//             [`${slot}.decidedBy`]: adminEmail
//           }
//         },
//         {
//           new: true,
//           runValidators: true
//         }
//       );

//       if (!updatedBooking) {
//         return res.status(409).json({
//           success: false,
//           message:
//             "This booking was updated by another request. Refresh the booking list and try again."
//         });
//       }

//       const admin1Status = updatedBooking.admin1Decision?.status || "pending";
//       const admin2Status = updatedBooking.admin2Decision?.status || "pending";

//       let finalStatus = "pending";

//       if (
//         admin1Status === "rejected" ||
//         admin2Status === "rejected"
//       ) {
//         finalStatus = "rejected";
//       } else if (
//         admin1Status === "cancelled" ||
//         admin2Status === "cancelled"
//       ) {
//         finalStatus = "cancelled";
//       } else if (
//         admin1Status === "approved" &&
//         admin2Status === "approved"
//       ) {
//         finalStatus = "approved";
//       }

//       // Update the overall status without modifying the room ID.
//       if (finalStatus !== updatedBooking.status) {
//         await Booking.updateOne(
//           {
//             _id: updatedBooking._id,
//             status: "pending"
//           },
//           {
//             $set: { status: finalStatus }
//           },
//           { runValidators: true }
//         );
//       }

//       const result = await populateBooking(
//         Booking.findById(updatedBooking._id)
//       );

//       let message;

//       if (finalStatus === "approved") {
//         message = "Both admins approved the booking. It is now approved.";
//       } else if (finalStatus === "rejected") {
//         message = "The booking was rejected by an admin.";
//       } else if (finalStatus === "cancelled") {
//         message = "The booking was cancelled by an admin.";
//       } else {
//         message =
//           `${getDecisionLabel(slot)} recorded ${status}. The booking is still pending the other admin's decision.`;
//       }

//       return res.status(200).json({
//         success: true,
//         message,
//         booking: result
//       });
//     } catch (error) {
//       return sendError(
//         res,
//         error,
//         "Could not update booking decision."
//       );
//     }
//   }
// );

// // --------------------------------------------------
// // CANCEL BOOKING
// // PATCH /api/bookings/:id/cancel
// //
// // A student can cancel their own pending/approved booking.
// // An admin cancellation also records that admin's decision.
// // --------------------------------------------------

// router.patch("/:id/cancel", protect, async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.isValidObjectId(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid booking ID."
//       });
//     }

//     const userId = getAuthenticatedUserId(req);
//     const isAdmin = req.user?.role === "admin";

//     if (!userId && !isAdmin) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid login session. Please log in again."
//       });
//     }

//     const booking = await Booking.findById(id);

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found."
//       });
//     }

//     const ownerId = String(booking.user);
//     const isOwner = userId && ownerId === userId;

//     if (!isOwner && !isAdmin) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not allowed to cancel this booking."
//       });
//     }

//     if (!["pending", "approved"].includes(booking.status)) {
//       return res.status(409).json({
//         success: false,
//         message: "This booking cannot be cancelled."
//       });
//     }

//     // If an administrator uses the cancellation endpoint,
//     // require their configured admin slot and record it.
//     if (isAdmin) {
//       const slot = getAdminSlot(req);

//       if (!slot) {
//         return res.status(403).json({
//           success: false,
//           message:
//             "Your admin email is not configured as Admin 1 or Admin 2. Check backend/.env."
//         });
//       }

//       const currentDecision = booking.get(slot);

//       if (currentDecision?.status !== "pending") {
//         return res.status(409).json({
//           success: false,
//           message:
//             `${getDecisionLabel(slot)} has already recorded a decision for this booking.`
//         });
//       }

//       const now = new Date();
//       const adminEmail = String(req.user?.email || "").trim();

//       const updated = await Booking.findOneAndUpdate(
//         {
//           _id: id,
//           status: booking.status,
//           [`${slot}.status`]: "pending"
//         },
//         {
//           $set: {
//             status: "cancelled",
//             [`${slot}.status`]: "cancelled",
//             [`${slot}.decidedAt`]: now,
//             [`${slot}.decidedBy`]: adminEmail
//           }
//         },
//         {
//           new: true,
//           runValidators: true
//         }
//       );

//       if (!updated) {
//         return res.status(409).json({
//           success: false,
//           message:
//             "The booking changed before it could be cancelled. Refresh and try again."
//         });
//       }

//       const result = await populateBooking(
//         Booking.findById(updated._id)
//       );

//       return res.status(200).json({
//         success: true,
//         message: "Booking cancelled by admin.",
//         booking: result
//       });
//     }

//     // Student cancellation: update only the overall status.
//     // Do not change booking.room, which must remain a Room ObjectId.
//     const updatedBooking = await Booking.findOneAndUpdate(
//       {
//         _id: id,
//         user: userId,
//         status: booking.status
//       },
//       {
//         $set: { status: "cancelled" }
//       },
//       {
//         new: true,
//         runValidators: true
//       }
//     );

//     if (!updatedBooking) {
//       return res.status(409).json({
//         success: false,
//         message:
//           "The booking changed before it could be cancelled. Refresh and try again."
//       });
//     }

//     const result = await populateBooking(
//       Booking.findById(updatedBooking._id)
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Booking cancelled successfully.",
//       booking: result
//     });
//   } catch (error) {
//     return sendError(res, error, "Could not cancel booking.");
//   }
// });

// export default router;