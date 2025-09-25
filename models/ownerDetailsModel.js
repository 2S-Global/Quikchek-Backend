import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema(
  {
    complex_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    block: {
      type: String,
    },
    flat_no: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    user_type: {
      type: String,
      default: "owner",
    },
    email: {
      type: String,
      required: true,
      // unique: true,
    },
    phone_number: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    is_del: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    role: {
      /* 0 for admin ,1 for candidate ,2 for company  */
      type: Number,
      required: true,
      default: 6,
    },
  },
  {
    timestamps: true,
  }
);

const ownerdetails = mongoose.model(
  "ownerdetails",
  ownerSchema,
  "ownerdetails"
);

export default ownerdetails;
