import mongoose from 'mongoose';

const termsSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
  },
  { timestamps: true }
);

const Terms = mongoose.model('Terms', termsSchema);

export default Terms;
