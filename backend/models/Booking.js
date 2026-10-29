import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."]
    },

    // Store the MongoDB Room document ID, never its display name.
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required."]
    },

    date: {
      type: String,
      required: [true, "Booking date is required."],
      trim: true,
      validate: {
        validator: function (value) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
            return false;
          }

          const [year, month, day] = value.split("-").map(Number);
          const parsed = new Date(
            Date.UTC(year, month - 1, day)
          );

          return (
            parsed.getUTCFullYear() === year &&
            parsed.getUTCMonth() === month - 1 &&
            parsed.getUTCDate() === day
          );
        },
        message: "Enter a valid booking date in YYYY-MM-DD format."
      }
    },

    startTime: {
      type: String,
      required: [true, "Start time is required."],
      trim: true,
      match: [
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Start time must use HH:mm format."
      ]
    },

    endTime: {
      type: String,
      required: [true, "End time is required."],
      trim: true,
      match: [
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "End time must use HH:mm format."
      ],
      validate: {
        validator: function (value) {
          if (!value || !this.startTime) return true;
          return value > this.startTime;
        },
        message: "End time must be later than start time."
      }
    },

    purpose: {
      type: String,
      required: [true, "Booking purpose is required."],
      trim: true,
      minlength: [3, "Purpose must contain at least 3 characters."],
      maxlength: [500, "Purpose cannot exceed 500 characters."]
    },

    attendees: {
      type: Number,
      required: [true, "Number of attendees is required."],
      min: [1, "At least one attendee is required."],
      validate: {
        validator: Number.isSafeInteger,
        message: "Attendee count must be a whole number."
      }
    },

    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "approved",
          "rejected",
          "cancelled"
        ],
        message: "Invalid booking status."
      },
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

// Indexes for booking history and room availability checks.
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ room: 1, date: 1, status: 1 });

// Prevent model recompilation errors during development.
const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);

export default Booking;









// import mongoose from "mongoose";

// // Stores the decision made by each administrator.
// const adminDecisionSchema = new mongoose.Schema(
//   {
//     status: {
//       type: String,
//       enum: ["pending", "approved", "rejected", "cancelled"],
//       default: "pending"
//     },

//     decidedAt: {
//       type: Date,
//       default: null
//     },

//     decidedBy: {
//       type: String,
//       default: ""
//     }
//   },
//   {
//     _id: false
//   }
// );

// const bookingSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "User is required."]
//     },

//     // Store the Room document's MongoDB ObjectId.
//     room: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Room",
//       required: [true, "Room is required."]
//     },

//     date: {
//       type: String,
//       required: [true, "Booking date is required."],
//       trim: true,
//       validate: {
//         validator: function (value) {
//           if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
//             return false;
//           }

//           const [year, month, day] = value.split("-").map(Number);

//           const parsed = new Date(
//             Date.UTC(year, month - 1, day)
//           );

//           return (
//             parsed.getUTCFullYear() === year &&
//             parsed.getUTCMonth() === month - 1 &&
//             parsed.getUTCDate() === day
//           );
//         },
//         message: "Enter a valid booking date in YYYY-MM-DD format."
//       }
//     },

//     startTime: {
//       type: String,
//       required: [true, "Start time is required."],
//       trim: true,
//       match: [
//         /^([01]\d|2[0-3]):[0-5]\d$/,
//         "Start time must use HH:mm format."
//       ]
//     },

//     endTime: {
//       type: String,
//       required: [true, "End time is required."],
//       trim: true,
//       match: [
//         /^([01]\d|2[0-3]):[0-5]\d$/,
//         "End time must use HH:mm format."
//       ],
//       validate: {
//         validator: function (value) {
//           if (!value || !this.startTime) return true;

//           return value > this.startTime;
//         },
//         message: "End time must be later than start time."
//       }
//     },

//     purpose: {
//       type: String,
//       required: [true, "Booking purpose is required."],
//       trim: true,
//       minlength: [
//         3,
//         "Purpose must contain at least 3 characters."
//       ],
//       maxlength: [
//         500,
//         "Purpose cannot exceed 500 characters."
//       ]
//     },

//     attendees: {
//       type: Number,
//       required: [true, "Number of attendees is required."],
//       min: [1, "At least one attendee is required."],
//       validate: {
//         validator: Number.isSafeInteger,
//         message: "Attendee count must be a whole number."
//       }
//     },

//     // Overall status displayed on the student's account.
//     status: {
//       type: String,
//       enum: {
//         values: [
//           "pending",
//           "approved",
//           "rejected",
//           "cancelled"
//         ],
//         message: "Invalid booking status."
//       },
//       default: "pending"
//     },

//     // Independent decision by Admin 1.
//     admin1Decision: {
//       type: adminDecisionSchema,
//       default: () => ({})
//     },

//     // Independent decision by Admin 2.
//     admin2Decision: {
//       type: adminDecisionSchema,
//       default: () => ({})
//     }
//   },
//   {
//     timestamps: true
//   }
// );

// // Indexes for booking history and room availability.
// bookingSchema.index({ user: 1, date: 1 });
// bookingSchema.index({ room: 1, date: 1, status: 1 });

// // Avoid recompilation errors during development.
// const Booking =
//   mongoose.models.Booking ||
//   mongoose.model("Booking", bookingSchema);

// export default Booking;
