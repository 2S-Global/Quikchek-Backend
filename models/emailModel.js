import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  employer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  company_email: {
    type: String,
  },

  month_no: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  email_sent: {
    type: Boolean,
    default: false,
  },
  email_sent_date: {
    type: Date,
  },
  feedback: {
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
});

const Email = mongoose.model("Email", emailSchema);
export default Email;
