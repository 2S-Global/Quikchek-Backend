import mongoose from "mongoose";

const userVerificationSchema = new mongoose.Schema(
  {
    employer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order_ref_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "allOrdersData",
    },
    order_id: {
      type: String,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
    amount: {
      type: String,
    },
    pdf_url: {
      type: String,
    },
    candidate_name: {
      type: String,
      required: false,
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
    pan_name: {
      type: String, // Fixed typo
    },
    pan_number: {
      type: String, // Fixed typo
    },
    pan_response: {
      type: Object,
    },
    pan_image: {
      type: String, // Ensure marks is stored properly
    },
    aadhar_name: {
      type: String, // Fixed typo
    },
    aadhar_number: {
      type: String, // Fixed typo
    },
    aadhaar_response: {
      type: Object,
    },
    aadhar_image: {
      type: String, // Ensure marks is stored properly
    },
    dl_name: {
      type: String, // Fixed typo
    },
    dl_number: {
      type: String, // Fixed typo
    },

    dl_response: {
      type: Object,
    },
    dl_image: {
      type: String, // Ensure marks is stored properly
    },
    passport_name: {
      type: String, // Fixed typo
    },
    passport_file_number: {
      type: String, // Fixed typo
    },
    passport_response: {
      type: Object,
    },
    passport_image: {
      type: String, // Ensure marks is stored properly
    },
    epic_name: {
      type: String, // Fixed typo
    },
    epic_number: {
      type: String, // Fixed typo
    },
    epic_response: {
      type: Object,
    },
    epic_image: {
      type: String, // Ensure marks is stored properly
    },

    uan_name: {
      type: String,
    },
    uan_number: {
      type: String,
    },
    uan_response: {
      type: Object,
    },
    epfo_name: {
      type: String,
    },
    epfo_number: {
      type: String,
    },
    epfo_response: {
      type: Object,
    },
    aadhat_otp: {
      type: String,
      default: "no",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },

    is_del: {
      type: Boolean,
      default: false,
    },
    is_paid: {
      type: Number,
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

const UserVerification = mongoose.model(
  "UserVerificationOrder",
  userVerificationSchema
);

export default UserVerification;
