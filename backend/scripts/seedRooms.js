
// import mongoose from "mongoose";
// import "dotenv/config";
// import Room from "../models/Room.js";

// const buildings = [
//   {
//     building: "Central Library",
//     names: Array.from({ length: 8 }, (_, i) => `CL ${i + 1}`)
//   },
//   {
//     building: "Block 1",
//     names: Array.from({ length: 5 }, (_, i) => `B1 ${i + 21}`)
//   },
//   {
//     building: "Block 2",
//     names: Array.from({ length: 5 }, (_, i) => `B2 ${i + 21}`)
//   },
//   {
//     building: "Block 3",
//     names: Array.from({ length: 5 }, (_, i) => `B3 ${i + 21}`)
//   },
//   {
//     building: "Block 4",
//     names: Array.from({ length: 5 }, (_, i) => `B4 ${i + 21}`)
//   }
// ];

// async function seedRooms() {
//   try {
//     if (!process.env.MONGO_URI) {
//       throw new Error("MONGO_URI is missing from backend/.env");
//     }

//     await mongoose.connect(process.env.MONGO_URI);

//     const roomRecords = buildings.flatMap(({ building, names }) =>
//       names.map((name) => ({
//         name,
//         building,
//         capacity: 30,
//         description: `Campus room ${name} in ${building}.`,
//         equipment: []
//       }))
//     );

//     // Upsert each room so rerunning the script does not duplicate it.
//     for (const room of roomRecords) {
//       await Room.updateOne(
//         { name: room.name, building: room.building },
//         { $setOnInsert: room },
//         { upsert: true, runValidators: true }
//       );
//     }

//     console.log(`Room setup complete: ${roomRecords.length} rooms checked.`);
//   } catch (error) {
//     console.error("Room setup failed:", error.message);
//     process.exitCode = 1;
//   } finally {
//     await mongoose.disconnect();
//   }
// }

// seedRooms();







// import "dotenv/config";
// import mongoose from "mongoose";
// import Room from "../models/Room.js";

// const buildings = [
//   {
//     building: "Central Library",
//     names: Array.from({ length: 8 }, (_, i) => `CL ${i + 1}`),
//   },
//   {
//     building: "Block 1",
//     names: Array.from({ length: 5 }, (_, i) => `B1 ${i + 21}`),
//   },
//   {
//     building: "Block 2",
//     names: Array.from({ length: 5 }, (_, i) => `B2 ${i + 21}`),
//   },
//   {
//     building: "Block 3",
//     names: Array.from({ length: 5 }, (_, i) => `B3 ${i + 21}`),
//   },
//   {
//     building: "Block 4",
//     names: Array.from({ length: 5 }, (_, i) => `B4 ${i + 21}`),
//   },
// ];

// async function seedRooms() {
//   try {
//     if (!process.env.MONGO_URI) {
//       throw new Error("MONGO_URI is missing from backend/.env");
//     }

//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("Connected to MongoDB.");

//     let added = 0;
//     let existing = 0;
//     let reactivated = 0;

//     for (const { building, names } of buildings) {
//       for (const name of names) {
//         const roomData = {
//           name,
//           building,
//           capacity: 30,
//           description: `Campus room ${name} in ${building}.`,
//           equipment: [],
//           location: building,
//           isActive: true,
//         };

//         const room = await Room.findOne({
//           name,
//           building,
//         });

//         if (room) {
//           if (!room.isActive) {
//             room.isActive = true;
//             await room.save();
//             reactivated++;
//             console.log(`Reactivated: ${name}`);
//           } else {
//             existing++;
//           }

//           continue;
//         }

//         await Room.create(roomData);
//         added++;
//         console.log(`Created: ${name} (${building})`);
//       }
//     }

//     const totalRooms = await Room.countDocuments();
//     const activeRooms = await Room.countDocuments({ isActive: true });

//     console.log("\n========== ROOM SETUP COMPLETE ==========");
//     console.log(`Expected rooms: 28`);
//     console.log(`New rooms created: ${added}`);
//     console.log(`Existing active rooms: ${existing}`);
//     console.log(`Inactive rooms reactivated: ${reactivated}`);
//     console.log(`Total room records in database: ${totalRooms}`);
//     console.log(`Active room records: ${activeRooms}`);
//     console.log("==========================================");
//   } catch (error) {
//     console.error("Room setup failed:", error.message);
//     process.exitCode = 1;
//   } finally {
//     if (mongoose.connection.readyState !== 0) {
//       await mongoose.disconnect();
//     }
//   }
// }

// seedRooms();






import "dotenv/config";
import mongoose from "mongoose";
import Room from "../models/Room.js";

const buildings = [
  {
    building: "Central Library",
    names: Array.from({ length: 8 }, (_, i) => `CL ${i + 1}`)
  },
  ...[1, 2, 3, 4].map((block) => ({
    building: `Block ${block}`,
    names: Array.from({ length: 5 }, (_, i) => `B${block} ${i + 21}`)
  }))
];

async function seedRooms() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    let created = 0;
    let activated = 0;

    for (const group of buildings) {
      for (const name of group.names) {
        const result = await Room.updateOne(
          { name, building: group.building },
          {
            $set: {
              isActive: true,
              building: group.building
            },
            $setOnInsert: {
              name,
              capacity: 30,
              description: `Campus room ${name} in ${group.building}.`,
              equipment: [],
              location: group.building
            }
          },
          {
            upsert: true,
            runValidators: true
          }
        );

        if (result.upsertedCount > 0) {
          created++;
        } else if (result.modifiedCount > 0) {
          activated++;
        }
      }
    }

    const total = await Room.countDocuments();
    const active = await Room.countDocuments({ isActive: true });

    console.log("\n========== ROOM SETUP COMPLETE ==========");
    console.log("Expected rooms: 28");
    console.log("New rooms created:", created);
    console.log("Existing rooms activated/updated:", activated);
    console.log("Total room records:", total);
    console.log("Active room records:", active);

    if (active < 28) {
      console.log(
        "WARNING: Some room records are still inactive or missing."
      );
    }
  } catch (error) {
    console.error("Room setup failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedRooms();
