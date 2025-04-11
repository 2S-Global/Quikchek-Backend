import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({

    employer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    order_ids: {
        type: String,
    },
    transactionId: {
        type: String,
     
    },
    amount: {
        type: Number,
    },
    paymentids: {
        type: String,
    },
        payment_method:{
        type:String,
        enum:["Live","Wallet"]

    },
    payment_type: {
        type: String,
        enum: ["credit", "debit"],
      
      },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    paymenttime: {
        type: Date,
        default: Date.now,
    },
    is_del: {
        type: Boolean,
        default: false,
    },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
