// import mongoose from "mongoose";

// const roomSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       unique: true
//     },
//     description: {
//       type: String,
//       default: ""
//     },
//     capacity: {
//       type: Number,
//       default: 50
//     },
//     equipment: {
//       type: [String],
//       default: []
//     },
//     location: {
//       type: String,
//       default: ""
//     },
//     isActive: {
//       type: Boolean,
//       default: true
//     }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Room", roomSchema);
    





// // const mongoose = require("mongoose");

// // const roomSchema = new mongoose.Schema(
// //   {
// //     name: {
// //       type: String,
// //       required: true,
// //       unique: true
// //     },
// //     building: {
// //       type: String,
// //       required: true
// //     },
// //     description: {
// //       type: String,
// //       default: "Campus room available for booking."
// //     },
// //     capacity: {
// //       type: Number,
// //       default: 50,
// //       min: 1
// //     },
// //     equipment: [String],
// //     image: String,
// //     active: {
// //       type: Boolean,
// //       default: true
// //     }
// //   },
// //   { timestamps: true }
// // );

// // module.exports = mongoose.model("Room", roomSchema);







import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    building: {
      type: String,
      required: true,
      enum: [
        "Central Library",
        "Block 1",
        "Block 2",
        "Block 3",
        "Block 4"
      ],
      trim: true
    },

    description: {
      type: String,
      default: "Campus room available for booking.",
      trim: true
    },

    capacity: {
      type: Number,
      default: 50,
      min: 1
    },

    equipment: {
      type: [String],
      default: []
    },

    location: {
      type: String,
      default: "",
      trim: true
    },

    image: {
      type: String,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// A room name must be unique within its building.
roomSchema.index(
  { building: 1, name: 1 },
  { unique: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
