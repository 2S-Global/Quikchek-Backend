import PrivacyPolicy from "../models/privacyModel.js";
import mongoose from "mongoose";

// Get the current Privacy Policy
export const getPrivacyPolicy = async (req, res) => {
  try {
    const privacyPolicy = await PrivacyPolicy.findOne();

    if (!privacyPolicy) {
      return res.status(200).json({ message: 'No privacy policy found' });
    }

    // Clean the HTML tags from the content
    const cleanPrivacyContent = privacyPolicy.content.replace(/<[^>]*>/g, '');

    res.status(200).json({ privacy: { content: cleanPrivacyContent } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
