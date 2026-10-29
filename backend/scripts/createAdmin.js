// import "dotenv/config";

// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// import User from "../models/User.js";

// async function createAdmin() {
//   try {
//     // Check environment variables
//     const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

//     if (!MONGO_URI) {
//       throw new Error("MONGO_URI is missing from your .env file.");
//     }

//     if (!process.env.JWT_SECRET) {
//       throw new Error("JWT_SECRET is missing from your .env file.");
//     }

//     if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
//       throw new Error(
//         "Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in .env."
//       );
//     }

//     // Connect to MongoDB
//     await mongoose.connect(MONGO_URI);
//     console.log("Connected to MongoDB.");

//     const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

//     // Check whether this account already exists
//     const existingUser = await User.findOne({
//       email: normalizedEmail
//     });

//     if (existingUser) {
//       if (existingUser.role === "admin") {
//         console.log("An admin account with this email already exists.");
//       } else {
//         console.log(
//           "This email already belongs to a student account. No changes were made."
//         );
//       }

//       return;
//     }

//     // Hash the password before saving it
//     const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

//     // Create the administrator account
//     await User.create({
//       name: "Campus Administrator",
//       email: normalizedEmail,
//       password: hashedPassword,
//       role: "admin"
//     });

//     console.log("Admin account created successfully.");
//     console.log(`Admin email: ${normalizedEmail}`);
//     console.log("Use your configured admin password to log in.");
//   } catch (error) {
//     console.error("Admin creation failed:", error.message);
//     process.exitCode = 1;
//   } finally {
//     if (mongoose.connection.readyState !== 0) {
//       await mongoose.disconnect();
//     }
//   }
// }

// createAdmin();







// import "dotenv/config";

// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// import User from "../models/User.js";

// async function createAdmin() {
//   try {
//     const { MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD } =
//       process.env;

//     // 1. Validate environment variables
//     if (!MONGO_URI) {
//       throw new Error("MONGO_URI is missing from backend/.env.");
//     }

//     if (!JWT_SECRET) {
//       throw new Error("JWT_SECRET is missing from backend/.env.");
//     }

//     if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
//       throw new Error(
//         "ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env."
//       );
//     }

//     if (ADMIN_PASSWORD.length < 12) {
//       throw new Error(
//         "ADMIN_PASSWORD must contain at least 12 characters."
//       );
//     }

//     const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
//       throw new Error("ADMIN_EMAIL is not a valid email address.");
//     }

//     // 2. Connect to MongoDB
//     await mongoose.connect(MONGO_URI);
//     console.log("Connected to MongoDB.");

//     // 3. Check whether this email already exists
//     const existingUser = await User.findOne({
//       email: normalizedEmail
//     }).select("+password");

//     // 4. Never change a student account into an admin
//     if (existingUser && existingUser.role !== "admin") {
//       throw new Error(
//         "This email belongs to a student account. Choose a different ADMIN_EMAIL in backend/.env."
//       );
//     }

//     // 5. Hash the configured admin password
//     const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

//     if (existingUser) {
//       // Update the existing admin account
//       existingUser.name = "Campus Administrator";
//       existingUser.password = hashedPassword;
//       existingUser.role = "admin";

//       await existingUser.save();

//       console.log("Existing admin account updated successfully.");
//     } else {
//       // Create a new admin account
//       await User.create({
//         name: "Campus Administrator",
//         email: normalizedEmail,
//         password: hashedPassword,
//         role: "admin",
//         department: "",
//         phone: ""
//       });

//       console.log("Admin account created successfully.");
//     }

//     console.log("--------------------------------");
//     console.log("Admin setup completed.");
//     console.log("Admin email:", normalizedEmail);
//     console.log("Admin role: admin");
//     console.log("Use the password configured in backend/.env.");
//     console.log("--------------------------------");
//   } catch (error) {
//     console.error("Admin setup failed:", error.message);
//     process.exitCode = 1;
//   } finally {
//     if (mongoose.connection.readyState !== 0) {
//       await mongoose.disconnect();
//     }
//   }
// }

// createAdmin();








import "dotenv/config";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

async function createAdmin() {
  try {
    const {
      MONGO_URI,
      JWT_SECRET,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    } = process.env;

    // 1. Validate environment variables
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing from backend/.env.");
    }

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from backend/.env.");
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env."
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error(
        "ADMIN_PASSWORD must contain at least 12 characters."
      );
    }

    const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

    // Correct email validation regex
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      throw new Error("ADMIN_EMAIL is not a valid email address.");
    }

    // 2. Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // 3. Find the existing account
    const existingUser = await User.findOne({
      email: normalizedEmail
    }).select("+password");

    // Never convert an existing student account into an admin
    if (existingUser && existingUser.role !== "admin") {
      throw new Error(
        "This email belongs to a student account. Set a different ADMIN_EMAIL in backend/.env."
      );
    }

    // 4. Hash the configured password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    if (existingUser) {
      // Update the existing admin credentials
      existingUser.name = "Campus Administrator";
      existingUser.email = normalizedEmail;
      existingUser.password = hashedPassword;
      existingUser.role = "admin";

      await existingUser.save();

      console.log("Existing admin account updated successfully.");
    } else {
      // Create a new admin account
      await User.create({
        name: "Campus Administrator",
        email: normalizedEmail,
        password: hashedPassword,
        role: "admin",
        department: "",
        phone: ""
      });

      console.log("Admin account created successfully.");
    }

    console.log("--------------------------------");
    console.log("Admin setup completed successfully.");
    console.log("Admin email:", normalizedEmail);
    console.log("Admin role: admin");
    console.log("Use the password set in backend/.env.");
    console.log("--------------------------------");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

createAdmin();
