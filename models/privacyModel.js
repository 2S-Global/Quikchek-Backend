import mongoose from 'mongoose';

// Schema for the Privacy Policy
const privacyPolicySchema = new mongoose.Schema(
  {
    content: {
      type: String,

    },
  },
  { timestamps: true }
);

// Create and export the model
const PrivacyPolicy = mongoose.model('PrivacyPolicy', privacyPolicySchema);

export default PrivacyPolicy;
