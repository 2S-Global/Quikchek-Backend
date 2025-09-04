import mongoose from "mongoose";

const userRoleSchema = new mongoose.Schema(
  {
    role: {
      type: Number,
      required: true,
      unique: true, // each role number should be unique
    },
    role_name: {
      type: String,
      required: true,
      trim: true,
    },
    is_del: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// Create model
const UserRole = mongoose.model("Userrole", userRoleSchema);

export default UserRole;
