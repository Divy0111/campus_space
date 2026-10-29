import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: 100
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required."],
      select: false
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
      required: true
    },

    department: {
      type: String,
      default: "",
      trim: true
    },

    phone: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Export the User model
const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;
