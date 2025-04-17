import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";
import UserVerification from "../models/userVerificationModel.js";
import mongoose from "mongoose";

export const getTotal = async (req, res) => {
  try {
    const [
      totalUsers,
      totalActiveVerification,
      totalPendingVerifications,
      totalTransactionAmountAgg
    ] = await Promise.all([
      User.countDocuments({ role_id: 1 }), // Users with role_id = 1
      UserVerification.countDocuments({ all_verified: 1 }), // Fully verified users
   UserVerification.countDocuments({ all_verified: { $in: [1, null] } }), // Pending verification users
      Transaction.aggregate([ // Sum of all transaction amounts
        {
          $group: {
            _id: null, // No need for _id
            total: { $sum: "$amount" } // Sum the 'amount' field
          }
        },
        {
          $project: {
            _id: 0, // Remove _id field
            total: 1 // Keep the 'total' field
          }
        }
      ])
    ]);

    const totalTransactionAmount = totalTransactionAmountAgg[0]?.total || 0; // Safely access the result

    res.status(200).json({
      success: true,
      totalUsers,
      totalActiveVerification,
      totalPendingVerifications,
      totalTransactionAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
