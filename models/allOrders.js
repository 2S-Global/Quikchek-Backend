import mongoose from "mongoose";

const allOrdersSchema = new mongoose.Schema(
  {
    employer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ownerdetails",
      },
    ],
    balance: {
      type: String,
    },
    order_number: {
      type: String,
      required: true,
    },
    invoice_number: {
      type: String,
      /*  required: true, */
    },
    subtotal: {
      type: String,
    },
    cgst: {
      type: String,
      /*  required: true, */ //this
    },
    cgst_percent: {
      type: String,
      /* required: true, */ //this
    },
    sgst: {
      type: String,
      /*  required: true, */ //this
    },
    sgst_percent: {
      type: String,
      /* required: true,  */ //this
    },
    total_amount: {
      type: String,
    },
    discount_percent: {
      type: String, // Fixed typo
    },
    discount_amount: {
      type: String, // Fixed typo
    },
    total_numbers_users: {
      type: String, // Fixed typo
    },
    type: {
      type: String,
      default: "Debit",
    },
    payment_method: {
      type: String,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    is_del: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const allOrdersData = mongoose.model("allOrdersData", allOrdersSchema);

export default allOrdersData;
