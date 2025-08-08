import mongoose from "mongoose";

const userVerificationCartAadharOTPSchema = new mongoose.Schema(
  {
    employer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ownerdetails",
      required: false,
    },
    candidate_name: {
      type: String,
      required: true,
    },
    candidate_email: {
      type: String,
      required: false,
    },
    candidate_mobile: {
      type: String,
    },
    candidate_dob: {
      type: String,
      required: true,
    },
    candidate_address: {
      type: String,
    },
    candidate_gender: {
      type: String, // Fixed typo
    },

    aadhar_name: {
      type: String, // Fixed typo
    },
    aadhar_number: {
      type: String, // Fixed typo
    },
    aadhar_image: {
      type: String, // Ensure marks is stored properly
    },

    aadhat_otp: {
      type: String,
      default: "no",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    is_paid: {
      type: Number,
      default: 0,
    },

    is_del: {
      type: Boolean,
      default: false,
    },
    all_verified: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const UserCartVerificationAadhatOTP = mongoose.model(
  "UserVerificationCartAadhatOTP",
  userVerificationCartAadharOTPSchema
);

export default UserCartVerificationAadhatOTP;
