import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";


export const addTransaction = async (req, res) => {
  try {
    const { amount } = req.body;
    const employer_id = req.userId; // Ensure this comes from auth middleware
    const payment_method = "Wallet";
    const payment_type = "credit";

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    // 1. Create and save the transaction
    const newTransaction = new Transaction({
      employer_id,
      amount,
      payment_method,
      payment_type,
    });

    await newTransaction.save();

    // 2. Update user's wallet amount
    const user = await User.findById(employer_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.wallet_amount = (user.wallet_amount || 0) + Number(amount);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Transaction added and wallet updated",
      data: newTransaction,
      updated_wallet: user.wallet_amount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add transaction",
      error: error.message,
    });
  }
};

  export const getUserTransactions = async (req, res) => {
    try {
      const employer_id = req.userId;
      const payment_method = "Wallet";
  
      const transactions = await Transaction.find({ 
        employer_id,
        payment_method
      }).sort({ created_at: -1 });
  
      if (!transactions || transactions.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: "No wallet transactions found"
        });
      }
  
      res.status(200).json({ 
        success: true, 
        data: transactions 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch transactions", 
        error: error.message 
      });
    }
  };
  
  
