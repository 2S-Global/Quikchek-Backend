import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";


export const addTransaction = async (req, res) => {
    try {
      const { amount} = req.body;
      const employer_id = req.userId; // Make sure userId is populated from auth middleware
        const payment_method="Wallet";
        const payment_type="credit";


      if (!amount ) {
        return res.status(400).json({ success: false, message: "Amount are required" });
      }
  
      const newTransaction = new Transaction({
        employer_id,
        amount,
        payment_method,
        payment_type
      });
  
      await newTransaction.save();
  
      res.status(201).json({ success: true, message: "Transaction added", data: newTransaction });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to add transaction", error: error.message });
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
  
  