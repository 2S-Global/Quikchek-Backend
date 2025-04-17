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
        User.countDocuments({ role_id: 1 }),
        UserVerification.countDocuments({all_verified:1}),
        UserVerification.countDocuments({ all_verified: { $in: [1, null] } }), 
        Transaction.aggregate([
          {
            $group: {
            
              total: { $sum: "$amount" }
            }
          }
        ])
      ]);
  
      const totalTransactionAmount = totalTransactionAmountAgg[0]?.total || 0;
  
      res.status(200).json({
        success:true,
        totalUsers,
        totalActiveVerification,
        totalPendingVerifications,
        totalTransactionAmount
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  