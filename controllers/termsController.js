// const Terms = require('../models/TermsModel');

import Terms from "../models/TermsModel.js";

// Get current terms
export const getTerms = async (req, res) => {
  try {
    const terms = await Terms.findOne();

    if (!terms) {
      return res.status(200).json({ message: 'No terms found' });
    }

    res.status(200).json({ terms });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
