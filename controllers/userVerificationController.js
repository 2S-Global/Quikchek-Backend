import UserCartVerification from "../models/userVerificationCartModel.js";
import UserVerification from "../models/userVerificationModel.js";
import mongoose from "mongoose";
import axios from "axios";

import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";
import UserCartVerificationAadhatOTP from "../models/userVerificationCartAadhatOTPModel.js";

import allOrdersData from "../models/allOrders.js";
import generateInvoiceNo from "../controllers/Helpers/generateInvoiceno.js";

import nodemailer from "nodemailer";

// Register a new user
export const listUserVerifiedList = async (req, res) => {
  try {
    const employer_id = req.userId;

    if (!employer_id) {
      return res.status(400).json({ message: "Employer ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(employer_id)) {
      return res.status(400).json({ message: "Invalid Employer ID" });
    }

    // Fetch all records for the employer_id and sort by createdAt (newest first)
    const users = await UserVerification.find({
      employer_id,
      all_verified: 1,
    }).sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching verified users:", error);
    res.status(500).json({ message: error.message });
  }
};
export const verifyPAN = async (req, res) => {
  try {
    const { customer_pan_number, pan_holder_name, id } = req.body;
    const employer_id = req.userId;
    if (!employer_id) {
      return res.status(400).json({ message: "Employer ID is required" });
    }
    if (!customer_pan_number || !pan_holder_name) {
      return res
        .status(400)
        .json({ message: "PAN number and name are required" });
    }

    const panData = {
      mode: "sync",
      data: {
        customer_pan_number,
        pan_holder_name,
        consent: "Y",
        consent_text:
          "I hereby declare my consent agreement for fetching my information via ZOOP API",
      },
      task_id: "8bbb54f3-d299-4535-b00e-e74d2d5a3997",
    };

    const response = await axios.post(
      "https://live.zoop.one/api/v1/in/identity/pan/lite",
      panData,
      {
        headers: {
          "app-id": "67b8252871c07100283cedc6",
          "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
          "Content-Type": "application/json",
        },
      }
    );
    const panApiResponse = response.data;

    const updatedUser = await UserCartVerification.findByIdAndUpdate(
      id,
      {
        $set: {
          pan_response: panApiResponse,
        },
      },
      { new: true }
    );

    res.status(200).json(response.data);
    // res.status(200);
  } catch (error) {
    res.status(200).json({
      message: "PAN verification failed",
      error: error.response ? error.response.data : error.message,
    });
  }
};

export const verifyEPIC = async (req, res) => {
  try {
    const { customer_epic_number, name_to_match, id } = req.body;

    const employer_id = req.userId;
    if (!employer_id) {
      return res.status(400).json({ message: "Employer ID is required" });
    }

    if (!customer_epic_number || !name_to_match) {
      return res
        .status(400)
        .json({ message: "EPIC number and name are required" });
    }

    const epicData = {
      data: {
        customer_epic_number,
        name_to_match,
        consent: "Y",
        consent_text:
          "I hereby declare my consent agreement for fetching my information via ZOOP API",
      },
      task_id: "d15a2a3b-9989-46ef-9b63-e24728292dc0",
    };

    const response = await axios.post(
      "https://live.zoop.one/api/v1/in/identity/voter/advance",
      epicData,
      {
        headers: {
          "app-id": "67b8252871c07100283cedc6",
          "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
          "Content-Type": "application/json",
        },
      }
    );

    const epicApiResponse = response.data;

    const updatedUser = await UserCartVerification.findByIdAndUpdate(
      id,
      {
        $set: {
          epic_response: epicApiResponse,
        },
      },
      { new: true }
    );

    res.status(200).json(response.data);
    // res.status(200);
  } catch (error) {
    res.status(500).json({
      message: "EPIC verification failed",
      error: error.response ? error.response.data : error.message,
    });
  }
};

export const verifyAadhaar = async (req, res) => {
  try {
    const { customer_aadhaar_number, id } = req.body;

    if (!customer_aadhaar_number) {
      return res.status(400).json({ message: "Aadhaar number is required" });
    }

    const employer_id = req.userId;
    if (!employer_id) {
      return res.status(400).json({ message: "Employer ID is required" });
    }

    const aadhaarData = {
      mode: "sync",
      data: {
        customer_aadhaar_number,
        consent: "Y",
        consent_text:
          "I hereby declare my consent agreement for fetching my information via ZOOP API",
      },
      task_id: "ecc326d9-d676-4b10-a82b-50b4b9dd8a16",
    };

    const response = await axios.post(
      "https://live.zoop.one/api/v1/in/identity/aadhaar/verification",
      aadhaarData,
      {
        headers: {
          "app-id": "67b8252871c07100283cedc6",
          "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds timeout
        maxRedirects: 10,
      }
    );

    // const response =hello;

    const aadhaarApiResponse = response.data;

    const updatedUser = await UserVerification.findByIdAndUpdate(
      id,
      {
        $set: {
          aadhaar_response: aadhaarApiResponse,
        },
      },
      { new: true }
    );
    // res.status(200);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Aadhaar verification failed",
      error: error.response ? error.response.data : error.message,
    });
  }
};

export const cloneAndMoveRecordById = async (req, res) => {
  try {
    const { id } = req.body;

    const employer_id = req.userId;
    if (!employer_id) {
      return res.status(400).json({ message: "Employer ID is required" });
    }

    const record = await UserCartVerification.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    const { _id, ...recordData } = record.toObject();

    const newRecord = await UserVerification.create(recordData);

    await UserCartVerification.findByIdAndDelete(id);

    res.status(200).json({
      message: "Record successfully moved!",
      newRecord,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error moving record", error: error.message });
  }
};

export const searchUserVerifiedList = async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({ message: "Search keyword is required" });
    }

    // Build search condition (match from the start of the field)
    let filter = {
      all_verified: 1, // ✅ Only verified users
      is_del: false, // ✅ Exclude deleted users
      $or: [
        { candidate_name: { $regex: `^${keyword}`, $options: "i" } },
        { candidate_email: { $regex: `^${keyword}`, $options: "i" } },
        { candidate_mobile: { $regex: `^${keyword}`, $options: "i" } },
      ],
    };

    // Fetch users with filters
    const users = await UserVerification.find(filter);

    res.status(200).json({
      message: users.length ? "Users found" : "No verified users found",
      users,
    });
  } catch (error) {
    console.error("Error fetching verified users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyPassport = async (req, res) => {
  try {
    const employer_id = req.userId;
    if (!employer_id) {
      return res.status(400).json({ message: "Employer ID is required" });
    }
    const { customer_file_number, name_to_match, customer_dob, id } = req.body;

    if (!customer_file_number || !name_to_match || !customer_dob) {
      return res
        .status(400)
        .json({ message: "Passport number and name are required" });
    }

    const passportData = {
      mode: "sync",
      data: {
        customer_file_number,
        name_to_match,
        customer_dob,
        consent: "Y",
        consent_text:
          "I hereby declare my consent agreement for fetching my information via ZOOP API",
      },
      task_id: "8bbb54f3-d299-4535-b00e-e74d2d5a3997",
    };

    const response = await axios.post(
      "https://live.zoop.one/api/v1/in/identity/passport/advance",
      passportData,
      {
        headers: {
          "app-id": "67b8252871c07100283cedc6",
          "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
          "Content-Type": "application/json",
        },
      }
    );
    const passportApiResponse = response.data;

    const updatedUser = await UserCartVerification.findByIdAndUpdate(
      id,
      {
        $set: {
          passport_response: passportApiResponse,
          status: "1",
        },
      },
      { new: true }
    );

    res.status(200).json(response.data);
    // res.status(200);
  } catch (error) {
    res.status(200).json({
      message: "Passport verification failed",
      error: error.response ? error.response.data : error.message,
    });
  }
};

export const verifyDL = async (req, res) => {
  try {
    const { customer_dl_number, name_to_match, customer_dob, id } = req.body;

    if (!customer_dl_number || !name_to_match || !customer_dob) {
      return res
        .status(400)
        .json({ message: "DL number, name, and DOB are required" });
    }

    const dlData = {
      mode: "sync",
      data: {
        customer_dl_number,
        name_to_match,
        customer_dob,
        consent: "Y",
        consent_text:
          "I hereby declare my consent agreement for fetching my information via ZOOP API",
      },
      task_id: "f26eb21e-4c35-4491-b2d5-41fa0e545a34",
    };

    const response = await axios.post(
      "https://live.zoop.one/api/v1/in/identity/dl/advance",
      dlData,
      {
        headers: {
          "app-id": "67b8252871c07100283cedc6",
          "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds timeout
        maxRedirects: 10,
      }
    );

    const dlApiResponse = response.data;

    const updatedUser = await UserCartVerification.findByIdAndUpdate(
      id,
      {
        $set: {
          dl_response: dlApiResponse,
        },
      },
      { new: true }
    );

    res.status(200).json(response.data);
    // res.status(200);
  } catch (error) {
    res.status(500).json({
      message: "DL verification failed",
      error: error.response ? error.response.data : error.message,
    });
  }
};

export const verifiedDetails = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await UserVerification.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const paynow_OLDFUNC = async (req, res) => {
  try {
    const employer_id = req.userId;

    if (!employer_id) {
      return res.status(400).json({ error: "User ID is missing." });
    }

    const { razorpay_response, amount, paymentIds } = req.body;

    if (!razorpay_response?.razorpay_payment_id || !amount) {
      return res.status(400).json({ error: "Incomplete payment details." });
    }

    // Step 1: Update the 'is_paid' field to 1 for all records of this employer
    const updatedUsers = await UserCartVerification.updateMany(
      { employer_id: employer_id },
      { $set: { is_paid: 1, createdAt: new Date() } }
    );

    if (updatedUsers.nModified === 0) {
      return res
        .status(404)
        .json({ message: "No users found for this employer" });
    }

    // Step 2: Insert the updated records into the 'ArchivedUserCartVerification' table
    const usersToArchive = await UserCartVerification.find({
      employer_id: employer_id,
      is_paid: 1,
    });

    if (usersToArchive.length === 0) {
      return res.status(404).json({ message: "No updated users to archive" });
    }

    // Insert the updated records into the archived collection
    await UserVerification.insertMany(usersToArchive);

    const userIds = usersToArchive.map((user) => user._id);

    // Step 3: Optionally, delete the records from the original collection (if you want to move them)
    await UserCartVerification.deleteMany({
      employer_id: employer_id,
      is_paid: 1,
    });
    // Save transaction
    const transaction = new Transaction({
      employer_id: employer_id,
      transactionId: razorpay_response.razorpay_payment_id,
      amount: amount,
      paymentids: paymentIds,
      order_ids: userIds.join(","),
    });

    await transaction.save();
    console.log("Transaction saved:", transaction);
    return res.status(200).json({
      message:
        "Payment status updated, records archived, and original records deleted",
      archivedUsersCount: UserVerification.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error processing payment",
      error: error.message,
    });
  }
};

export const paynow_TODAY_14 = async (req, res) => {
  try {
    const employer_id = req.userId;

    if (!employer_id) {
      return res.status(400).json({ error: "User ID is missing." });
    }

    const { razorpay_response, amount, paymentIds, payment_method } = req.body;

    if (!amount || !payment_method) {
      return res.status(400).json({ error: "Payment details are incomplete." });
    }

    const user = await User.findById(employer_id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check wallet balance if payment_method is Wallet
    if (payment_method === "Wallet") {
      if (!user.wallet_amount || user.wallet_amount < amount) {
        return res.status(400).json({ error: "Insufficient wallet balance." });
      }

      // Deduct wallet amount
      user.wallet_amount -= amount;
      await user.save();
    } else if (payment_method === "online") {
      if (!razorpay_response?.razorpay_payment_id) {
        return res
          .status(400)
          .json({ error: "Razorpay payment ID is missing." });
      }
    } else {
      return res.status(400).json({ error: "Invalid payment method." });
    }

    // Step 1: Update the 'is_paid' field to 1 for all records of this employer
    const updatedUsers = await UserCartVerification.updateMany(
      { employer_id: employer_id },
      { $set: { is_paid: 1, createdAt: new Date() } }
    );

    if (updatedUsers.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No users found for this employer" });
    }

    // Step 2: Insert the updated records into the archived collection
    const usersToArchive = await UserCartVerification.find({
      employer_id: employer_id,
      is_paid: 1,
    });

    if (usersToArchive.length === 0) {
      return res.status(404).json({ message: "No updated users to archive" });
    }

    await UserVerification.insertMany(usersToArchive);

    const userIds = usersToArchive.map((user) => user._id);

    // Step 3: Delete original records
    await UserCartVerification.deleteMany({
      employer_id: employer_id,
      is_paid: 1,
    });

    // Step 4: Save transaction
    const transaction = new Transaction({
      employer_id: employer_id,
      transactionId:
        payment_method === "Live"
          ? razorpay_response.razorpay_payment_id
          : `wallet_${Date.now()}`,
      amount: amount,
      paymentids: paymentIds || null,
      order_ids: userIds.join(","),
      payment_method: payment_method,
      payment_type: "debit",
    });

    await transaction.save();

    return res.status(200).json({
      message:
        "Payment processed, verifications archived, and transaction recorded",
      archivedUsersCount: usersToArchive.length,
      remainingWalletBalance: user.wallet_amount,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({
      message: "Error processing payment2",
      error: error.message,
    });
  }
};

export const paynowAadharOTP = async (req, res) => {
  try {
    const employer_id = req.userId;

    if (!employer_id) {
      return res.status(400).json({ error: "User ID is missing." });
    }

    const { razorpay_response, amount, paymentIds, payment_method } = req.body;

    if (!amount || !payment_method) {
      return res.status(400).json({ error: "Payment details are incomplete." });
    }

    const parsedAmount = parseFloat(amount);

    const user = await User.findById(employer_id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (payment_method === "online") {
      if (!razorpay_response?.razorpay_payment_id) {
        return res
          .status(400)
          .json({ error: "Razorpay payment ID is missing." });
      }
    } else {
      return res.status(400).json({ error: "Invalid payment method." });
    }

    // Update is_paid field
    const updatedUsers = await UserCartVerificationAadhatOTP.updateMany(
      { employer_id: employer_id },
      { $set: { is_paid: 1, aadhat_otp: "yes", createdAt: new Date() } }
    );

    if (updatedUsers.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No users found for this employer" });
    }

    // Get users to archive
    const usersToArchive = await UserCartVerificationAadhatOTP.find({
      employer_id: employer_id,
      is_paid: 1,
    });

    if (usersToArchive.length === 0) {
      return res.status(404).json({ message: "No updated users to archive" });
    }

    // Use the first user to get Aadhaar details (assuming same for all)
    const aadhaarNumber = usersToArchive[0]?.aadhar_number || "";
    const nameToMatch = usersToArchive[0]?.aadhar_name || "";

    // Generate and assign order_id to each record
    const orderPrefix = `ORD-${Date.now()}`;
    const usersWithOrderId = usersToArchive.map((user, index) => {
      const obj = user.toObject();
      obj.order_id = `${orderPrefix}-${index + 1}`;
      delete obj._id; // Remove _id so MongoDB can generate a new one
      return obj;
    });

    const userId = usersToArchive[0]?._id;
    // amount: parsedAmount,
    // Save transaction after userIds is ready
    const transaction = new Transaction({
      employer_id: employer_id,
      transactionId: razorpay_response.razorpay_payment_id,
      amount: parsedAmount,
      paymentids: paymentIds || null,
      order_ids: userId,
      payment_method: payment_method,
      payment_type: "debit",
    });

    await transaction.save();

    // Optional: Insert into archive collection
    // await UserVerification.insertMany(usersWithOrderId);
    const insertedDoc = await UserVerification.create(usersWithOrderId[0]);
    const newId = insertedDoc._id;
    // Optional: Remove from cart after archiving
    // await UserCartVerificationAadhatOTP.deleteMany({ employer_id: employer_id, is_paid: 1 });
    await UserCartVerificationAadhatOTP.deleteOne({
      employer_id: employer_id,
      is_paid: 1,
    });

    // Prepare Zoop payload
    const payload = {
      mode: "sync",
      data: {
        customer_aadhaar_number: aadhaarNumber,
        name_to_match: nameToMatch,
        consent: "Y",
        consent_text:
          "I hereby declare my consent agreement for fetching my information via ZOOP API",
      },
      task_id: "08b01aa8-9487-4e6d-a0f0-c796839d6b77",
    };

    const headers = {
      /* 
      "app-id": "67b8252871c07100283cedc6",
      "api-key": "YAR46W0-0S0MS44-M6KV686-Q1X70Z1", */
      "Content-Type": "application/json",
    };

    /*    const response = await axios.post(
      "https://live.zoop.one/in/identity/okyc/otp/request",
      payload,
      { headers }
    ); */
    const response = await axios.post(
      "https://api.quickekyc.com/api/v1/aadhaar-v2/generate-otp",
      {
        key: "0196b58f-2f35-4c99-b219-aa8339013476",
        id_number: aadhaarNumber,
      },
      { headers }
    );

    return res.status(200).json({
      message:
        "Payment processed, verifications archived, and transaction recorded",
      aadhar_response: response.data,
      archivedUsersCount: usersWithOrderId.length,
      remainingWalletBalance: user.wallet_amount,
      newId: newId,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({
      message: "Error processing payment",
      error: error.message,
    });
  }
};

export const paynowAadharOTPFree = async (req, res) => {
  try {

    console.log("I am inside paynowAadharOTPFree API");
    const employer_id = req.userId;
    console.log("My employer id ----  employer_id: ", employer_id);

    if (!employer_id) {
      return res.status(400).json({ error: "User ID is missing." });
    }

    const { amount, paymentIds, payment_method } = req.body;

    /*     if (!amount || !payment_method) {
      return res.status(400).json({ error: "Payment details are incomplete." });
    } */

    const parsedAmount = parseFloat(amount);

    const user = await User.findById(employer_id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (payment_method === "Free") {
    } else {
      return res.status(400).json({ error: "Invalid payment method." });
    }

    // Update is_paid field
    const updatedUsers = await UserCartVerificationAadhatOTP.updateMany(
      { employer_id: employer_id },
      { $set: { is_paid: 1, aadhat_otp: "yes", createdAt: new Date() } }
    );

    console.log("updatedUsers Value: ", updatedUsers);

    if (updatedUsers.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No users found for this employer" });
    }

    // Get users to archive
    const usersToArchive = await UserCartVerificationAadhatOTP.find({
      employer_id: employer_id,
      is_paid: 1,
    });

    if (usersToArchive.length === 0) {
      return res.status(404).json({ message: "No updated users to archive" });
    }

    // Use the first user to get Aadhaar details (assuming same for all)
    const aadhaarNumber = usersToArchive[0]?.aadhar_number || "";
    const nameToMatch = usersToArchive[0]?.aadhar_name || "";

    // Generate and assign order_id to each record
    const orderPrefix = `ORD-${Date.now()}`;
    const usersWithOrderId = usersToArchive.map((user, index) => {
      const obj = user.toObject();
      obj.order_id = `${orderPrefix}-${index + 1}`;
      delete obj._id; // Remove _id so MongoDB can generate a new one
      return obj;
    });

    const userId = usersToArchive[0]?._id;
    // amount: parsedAmount,
    // Save transaction after userIds is ready
    const transaction = new Transaction({
      employer_id: employer_id,
      transactionId: "",
      amount: parsedAmount,
      paymentids: paymentIds || null,
      order_ids: userId,
      payment_method: payment_method,
      payment_type: "debit",
    });

    await transaction.save();

    // Optional: Insert into archive collection
    // await UserVerification.insertMany(usersWithOrderId);
    const insertedDoc = await UserVerification.create(usersWithOrderId[0]);
    const newId = insertedDoc._id;
    // Optional: Remove from cart after archiving
    // await UserCartVerificationAadhatOTP.deleteMany({ employer_id: employer_id, is_paid: 1 });
    await UserCartVerificationAadhatOTP.deleteOne({
      employer_id: employer_id,
      is_paid: 1,
    });

    // Prepare Zoop payload
    const payload = {
      mode: "sync",
      data: {
        customer_aadhaar_number: aadhaarNumber,
        name_to_match: nameToMatch,
        consent: "Y",
        consent_text:
          "I hereby declare my consent agreement for fetching my information via ZOOP API",
      },
      task_id: "08b01aa8-9487-4e6d-a0f0-c796839d6b77",
    };

    const headers = {
      /* 
      "app-id": "68020766d125b80028ec9ba0",
      "api-key": "YAR46W0-0S0MS44-M6KV686-Q1X70Z1", */
      "Content-Type": "application/json",
    };

    /*    const response = await axios.post(
      "https://live.zoop.one/in/identity/okyc/otp/request",
      payload,
      { headers }
    ); */
    const response = await axios.post(
      "https://api.quickekyc.com/api/v1/aadhaar-v2/generate-otp",
      {
        key: "0196b58f-2f35-4c99-b219-aa8339013476",
        id_number: aadhaarNumber,
      },
      { headers }
    );

    return res.status(200).json({
      message:
        "Payment processed, verifications archived, and transaction recorded",
      aadhar_response: response.data,
      archivedUsersCount: usersWithOrderId.length,
      remainingWalletBalance: user.wallet_amount,
      newId: newId,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({
      message: "Error processing payment",
      error: error.message,
    });
  }
};

export const paynowAadharOTP_30042025 = async (req, res) => {
  try {
    const employer_id = req.userId;

    if (!employer_id) {
      return res.status(400).json({ error: "User ID is missing." });
    }

    const { razorpay_response, amount, paymentIds, payment_method } = req.body;

    if (!amount || !payment_method) {
      return res.status(400).json({ error: "Payment details are incomplete." });
    }

    const user = await User.findById(employer_id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (payment_method === "online") {
      if (!razorpay_response?.razorpay_payment_id) {
        return res
          .status(400)
          .json({ error: "Razorpay payment ID is missing." });
      }
    } else {
      return res.status(400).json({ error: "Invalid payment method." });
    }

    // Update is_paid field
    const updatedUsers = await UserCartVerificationAadhatOTP.updateMany(
      { employer_id: employer_id },
      { $set: { is_paid: 1, createdAt: new Date() } }
    );

    if (updatedUsers.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No users found for this employer" });
    }

    const usersToArchive = await UserCartVerificationAadhatOTP.find({
      employer_id: employer_id,
      is_paid: 1,
    });

    if (usersToArchive.length === 0) {
      return res.status(404).json({ message: "No updated users to archive" });
    }

    // ✅ Generate and assign order_id to each record
    const orderPrefix = `ORD-${Date.now()}`;
    const usersWithOrderId = usersToArchive.map((user, index) => {
      const obj = user.toObject();
      obj.order_id = `${orderPrefix}-${index + 1}`;
      delete obj._id; // Remove _id so MongoDB can generate a new one
      return obj;
    });

    await UserVerification.insertMany(usersWithOrderId);

    const userIds = usersToArchive.map((user) => user._id);

    // await UserCartVerificationAadhatOTP.deleteMany({ employer_id: employer_id, is_paid: 1 });

    const transaction = new Transaction({
      employer_id: employer_id,
      transactionId:
        payment_method === "online"
          ? razorpay_response.razorpay_payment_id
          : `wallet_${Date.now()}`,
      amount: amount,
      paymentids: paymentIds || null,
      order_ids: userIds.join(","),
      payment_method: payment_method,
      payment_type: "debit",
    });

    await transaction.save();

    return res.status(200).json({
      message:
        "Payment processed, verifications archived, and transaction recorded",
      archivedUsersCount: usersWithOrderId.length,
      remainingWalletBalance: user.wallet_amount,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({
      message: "Error processing payment",
      error: error.message,
    });
  }
};

export const paynow_09052025 = async (req, res) => {
  try {
    const employer_id = req.userId;

    if (!employer_id) {
      return res.status(400).json({ error: "User ID is missing." });
    }

    const {
      razorpay_response,
      amount,
      paymentIds,
      payment_method,
      overall_billing,
    } = req.body;

    if (!amount || !payment_method) {
      return res.status(400).json({ error: "Payment details are incomplete." });
    }

    const user = await User.findById(employer_id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (payment_method === "Wallet") {
      if (!user.wallet_amount || user.wallet_amount < amount) {
        return res.status(400).json({ error: "Insufficient wallet balance." });
      }
      user.wallet_amount -= amount;
      await user.save();
    } else if (payment_method === "online") {
      if (!razorpay_response?.razorpay_payment_id) {
        return res
          .status(400)
          .json({ error: "Razorpay payment ID is missing." });
      }
    } else {
      return res.status(400).json({ error: "Invalid payment method." });
    }

    // Add all data in Orders Table
    //const moment = require('moment');
    // Get current date and time
    //const now = ${Date.now()};
    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    const newUserCart = new allOrdersData({
      employer_id: employer_id,
      order_number: orderNumber,
      invoice_number: invoiceNumber,
      subtotal: overall_billing.subtotal,
      cgst: overall_billing.cgst,
      cgst_percent: overall_billing.cgst_percent,
      sgst: overall_billing.sgst,
      sgst_percent: overall_billing.sgst_percent,
      total_amount: overall_billing.total,
      discount_percent: overall_billing.discount_percent,
      discount_amount: overall_billing.discount,
      total_numbers_users: overall_billing.total_verifications,
    });

    const savedCart = await newUserCart.save();
    const insertedId = savedCart._id;

    // Update is_paid field
    const updatedUsers = await UserCartVerification.updateMany(
      { employer_id: employer_id },
      { $set: { is_paid: 1, createdAt: new Date(), order_ref_id: insertedId } }
    );

    if (updatedUsers.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No users found for this employer" });
    }

    const usersToArchive = await UserCartVerification.find({
      employer_id: employer_id,
      is_paid: 1,
    });

    if (usersToArchive.length === 0) {
      return res.status(404).json({ message: "No updated users to archive" });
    }

    // ✅ Generate and assign order_id to each record
    const orderPrefix = `ORD-${Date.now()}`;
    const usersWithOrderId = usersToArchive.map((user, index) => {
      const obj = user.toObject();
      obj.order_id = `${orderPrefix}-${index + 1}`;
      delete obj._id; // Remove _id so MongoDB can generate a new one
      return obj;
    });

    await UserVerification.insertMany(usersWithOrderId);

    const userIds = usersToArchive.map((user) => user._id);

    await UserCartVerification.deleteMany({
      employer_id: employer_id,
      is_paid: 1,
    });

    const transaction = new Transaction({
      employer_id: employer_id,
      order_ref_id: insertedId,
      transactionId:
        payment_method === "online"
          ? razorpay_response.razorpay_payment_id
          : `wallet_${Date.now()}`,
      amount: amount,
      paymentids: paymentIds || null,
      order_ids: userIds.join(","),
      payment_method: payment_method,
      payment_type: "debit",
    });

    await transaction.save();

    return res.status(200).json({
      message:
        "Payment processed, verifications archived, and transaction recorded",
      archivedUsersCount: usersWithOrderId.length,
      remainingWalletBalance: user.wallet_amount,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({
      message: "Error processing payment22",
      error: error.message,
    });
  }
};

function convertDateFormat(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
}

export const verifyDataBackground = async (req, res) => {
  try {
    // Fetch only one user that needs verification
    const userCart = await UserVerification.findOne({
      is_paid: 1,
      is_del: false,
      all_verified: 0,
      $or: [{ aadhat_otp: "no" }, { aadhat_otp: { $exists: false } }],
    });

    if (!userCart) {
      console.log("No users left for verification.");
      return res
        .status(200)
        .json({ message: "No users left for verification." });
    }

    const currentUserID = userCart._id;

    console.log(userCart._id, " == >>>> ", userCart.candidate_name);
    // Function to introduce a delay
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // PAN verification
    if (userCart.pan_number && !userCart.pan_response) {
      try {
        const panData = {
          mode: "sync",
          data: {
            customer_pan_number: userCart.pan_number,
            pan_holder_name: userCart.pan_name,
            consent: "Y",
            consent_text:
              "I hereby declare my consent agreement for fetching my information via ZOOP API",
          },
          task_id: "8bbb54f3-d299-4535-b00e-e74d2d5a3997",
        };

        const response = await axios.post(
          "https://live.zoop.one/api/v1/in/identity/pan/lite",
          panData,
          {
            headers: {
              "app-id": "68020766d125b80028ec9ba0",
              "api-key": "YAR46W0-0S0MS44-M6KV686-Q1X70Z1",
              "Content-Type": "application/json",
            },
          }
        );

        await UserVerification.findByIdAndUpdate(
          currentUserID,
          { $set: { pan_response: response.data } },
          { new: true }
        );
        await delay(2000);
      } catch (error) {
        console.error(
          "PAN verification failed:",
          error?.response?.data || error.message
        );
      }
    }

    // Aadhaar verification
    if (userCart.aadhar_number && !userCart.aadhaar_response) {
      try {
        const aadhaarData = {
          mode: "sync",
          data: {
            customer_aadhaar_number: userCart.aadhar_number,
            consent: "Y",
            consent_text:
              "I hereby declare my consent agreement for fetching my information via ZOOP API",
          },
          task_id: "ecc326d9-d676-4b10-a82b-50b4b9dd8a16",
        };

        const response = await axios.post(
          "https://live.zoop.one/api/v1/in/identity/aadhaar/verification",
          aadhaarData,
          {
            headers: {
              "app-id": "68020766d125b80028ec9ba0",
              "api-key": "YAR46W0-0S0MS44-M6KV686-Q1X70Z1",
              "Content-Type": "application/json",
            },
          }
        );

        await UserVerification.findByIdAndUpdate(
          currentUserID,
          { $set: { aadhaar_response: response.data } },
          { new: true }
        );
        await delay(2000);
      } catch (error) {
        console.error(
          "Aadhaar verification failed:",
          error?.response?.data || error.message
        );
      }
    }

    // Driving License verification
    if (userCart.dl_number && !userCart.dl_response) {
      try {
        const dlData = {
          mode: "sync",
          data: {
            customer_dl_number: userCart.dl_number,
            name_to_match: userCart.dl_name,
            customer_dob: convertDateFormat(userCart.candidate_dob),
            consent: "Y",
            consent_text:
              "I hereby declare my consent agreement for fetching my information via ZOOP API",
          },
          task_id: "f26eb21e-4c35-4491-b2d5-41fa0e545a34",
        };

        const response = await axios.post(
          "https://live.zoop.one/api/v1/in/identity/dl/advance",
          dlData,
          {
            headers: {
              "app-id": "68020766d125b80028ec9ba0",
              "api-key": "YAR46W0-0S0MS44-M6KV686-Q1X70Z1",
              "Content-Type": "application/json",
            },
          }
        );

        await UserVerification.findByIdAndUpdate(
          currentUserID,
          { $set: { dl_response: response.data } },
          { new: true }
        );
        await delay(2000);
      } catch (error) {
        console.error(
          "Driving License verification failed:",
          error?.response?.data || error.message
        );
      }
    }

    // Passport verification
    if (userCart.passport_file_number && !userCart.passport_response) {
      try {
        const passportData = {
          mode: "sync",
          data: {
            customer_file_number: userCart.passport_file_number,
            name_to_match: userCart.passport_name,
            customer_dob: convertDateFormat(userCart.candidate_dob),
            consent: "Y",
            consent_text:
              "I hereby declare my consent agreement for fetching my information via ZOOP API",
          },
          task_id: "8bbb54f3-d299-4535-b00e-e74d2d5a3997",
        };

        const response = await axios.post(
          "https://live.zoop.one/api/v1/in/identity/passport/advance",
          passportData,
          {
            headers: {
              "app-id": "68020766d125b80028ec9ba0",
              "api-key": "YAR46W0-0S0MS44-M6KV686-Q1X70Z1",
              "Content-Type": "application/json",
            },
          }
        );

        await UserVerification.findByIdAndUpdate(
          currentUserID,
          { $set: { passport_response: response.data } },
          { new: true }
        );
        await delay(2000);
      } catch (error) {
        console.error(
          "Passport verification failed:",
          error?.response?.data || error.message
        );
      }
    }

    // EPIC (Voter ID) verification
    if (userCart.epic_number && !userCart.epic_response) {
      try {
        const epicData = {
          data: {
            customer_epic_number: userCart.epic_number,
            name_to_match: userCart.epic_name,
            consent: "Y",
            consent_text:
              "I hereby declare my consent agreement for fetching my information via ZOOP API",
          },
          task_id: "d15a2a3b-9989-46ef-9b63-e24728292dc0",
        };

        const response = await axios.post(
          "https://live.zoop.one/api/v1/in/identity/voter/advance",
          epicData,
          {
            headers: {
              "app-id": "68020766d125b80028ec9ba0",
              "api-key": "YAR46W0-0S0MS44-M6KV686-Q1X70Z1",
              "Content-Type": "application/json",
            },
          }
        );

        await UserVerification.findByIdAndUpdate(
          currentUserID,
          { $set: { epic_response: response.data } },
          { new: true }
        );
        await delay(2000);
      } catch (error) {
        console.error(
          "EPIC verification failed:",
          error?.response?.data || error.message
        );
      }
    }

    /////UAN VERIFICATION
    if (userCart.uan_number && !userCart.uan_response) {
      try {
        const data = {
          mode: "sync",
          data: {
            customer_uan_number: userCart.uan_number,
            consent: "Y",
            consent_text:
              "I consent to this information being shared with zoop.one.",
          },
          task_id: "ecc326d9-d676-4b10-a82b-50b4b9dd8a16",
        };

        const response = await axios.post(
          "https://live.zoop.one/api/v1/in/identity/uan/advance",
          data,
          {
            headers: {
              "app-id": "68020766d125b80028ec9ba0",
              "api-key": "YAR46W0-0S0MS44-M6KV686-Q1X70Z1",
              "Content-Type": "application/json",
            },
          }
        );

        await UserVerification.findByIdAndUpdate(
          currentUserID,
          { $set: { uan_response: response.data } },
          { new: true }
        );
        await delay(2000);
      } catch (error) {
        console.error(
          "UAN verification failed:",
          error?.response?.data || error.message
        );
      }
    }

    ///Epfo Verification
    if (userCart.epfo_number && !userCart.epfo_response) {
      try {
        const data = {
          mode: "sync",
          data: {
            customer_phone_number: "9051624898", // NOTE: phone is hardcoded, should come from userCart?
            consent: "Y",
            consent_text:
              "I hereby declare my consent agreement for fetching my information via ZOOP API",
          },
          task_id: "9791f6f3-3106-4385-b2f0-5d391f1463cb",
        };

        const response = await axios.post(
          "https://live.zoop.one/api/v1/in/identity/epfo/pro",
          data,
          {
            headers: {
              "app-id": "68020766d125b80028ec9ba0",
              "api-key": "YAR46W0-0S0MS44-M6KV686-Q1X70Z1",
              "Content-Type": "application/json",
            },
          }
        );

        await UserVerification.findByIdAndUpdate(
          currentUserID,
          { $set: { epfo_response: response.data } },
          { new: true }
        );
        await delay(2000);
      } catch (error) {
        console.error(
          "EPFO verification failed:",
          error?.response?.data || error.message
        );
      }
    }

    // After all verifications are done, update all_verified to 1
    await UserVerification.findByIdAndUpdate(
      currentUserID,
      { $set: { all_verified: 1 } },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Verification completed successfully for one user." });
  } catch (error) {
    console.error("Error fetching records:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifyUan = async (req, res) => {
  try {
    const data = {
      mode: "sync",
      data: {
        customer_uan_number: "100003213093",
        consent: "Y",
        consent_text:
          "I consent to this information being shared with zoop.one.",
      },
      task_id: "ecc326d9-d676-4b10-a82b-50b4b9dd8a16",
    };

    const response = await axios.post(
      "https://live.zoop.one/api/v1/in/identity/uan/advance",
      data,
      {
        headers: {
          "app-id": "67b8252871c07100283cedc6",
          "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);

    // Send response back to client
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error verifying UAN:",
      error?.response?.data || error.message
    );
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifyEpfo = async (req, res) => {
  try {
    const data = {
      mode: "sync",
      data: {
        customer_phone_number: "9051624898",
        consent: "Y",
        consent_text:
          "I hereby declare my consent agreement for fetching my information via ZOOP API",
      },
      task_id: "9791f6f3-3106-4385-b2f0-5d391f1463cb",
    };

    const response = await axios.post(
      "https://live.zoop.one/api/v1/in/identity/epfo/pro",
      data,
      {
        headers: {
          "app-id": "67b8252871c07100283cedc6",
          "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("EPFO Response:", response.data);

    // ✅ Send response to client
    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error(
      "Error verifying EPFO:",
      error.response?.data || error.message
    );

    // ✅ Send error response to client
    return res
      .status(500)
      .json({ success: false, error: error.response?.data || error.message });
  }
};

export const aadharWithOtp = async (req, res) => {
  try {
    const { aadhaarNumber, nameToMatch } = req.body; // Assuming client sends these as POST body

    const payload = {
      mode: "sync",
      data: {
        customer_aadhaar_number: aadhaarNumber,
        name_to_match: nameToMatch,
        consent: "Y",
        consent_text:
          "I hereby declare my consent agreement for fetching my information via ZOOP API",
      },
      task_id: "08b01aa8-9487-4e6d-a0f0-c796839d6b77",
    };

    const headers = {
      "app-id": "67b8252871c07100283cedc6",
      "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
      "Content-Type": "application/json",
    };

    // Call Zoop API for Aadhaar OTP request
    const response = await axios.post(
      "https://live.zoop.one/in/identity/okyc/otp/request",
      payload,
      { headers }
    );

    console.log("Aadhaar OTP Response:", response.data);

    // ✅ Send the response back to the client
    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error(
      "Error requesting Aadhaar OTP:",
      error.response?.data || error.message
    );

    // ✅ Send error response to client
    return res
      .status(500)
      .json({ success: false, error: error.response?.data || error.message });
  }
};

export const verifyOtpAadhar = async (req, res) => {
  try {
    // Destructure request body to get otp, request_id, and newId
    const { otp, request_id, newId } = req.body;

    // Prepare the payload to send to Zoop API
    const payload = {
      mode: "sync",
      data: {
        request_id: request_id,
        otp: otp,
        consent: "Y",
        consent_text:
          "I hereby declare my consent agreement for fetching my information via ZOOP API",
      },
      task_id: "08b01aa8-9487-4e6d-a0f0-c796839d6b77",
    };

    // Define headers for the API request
    const headers = {
      /* 
      "app-id": "67b8252871c07100283cedc6",
      "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW", */
      "Content-Type": "application/json",
    };

    // Call Zoop API to verify OTP
    /* const response = await axios.post(
      "https://live.zoop.one/in/identity/okyc/otp/verify",
      payload,
      { headers }
    ); */

    const response = await axios.post(
      "https://api.quickekyc.com/api/v1/aadhaar-v2/submit-otp",
      {
        key: "0196b58f-2f35-4c99-b219-aa8339013476",
        request_id: request_id,
        otp: otp,
      },
      { headers }
    );

    // console.log("OTP Verification Response:", response.data);
    console.log("New ID:", response.data.status_code);
    console.log("New MSG:", response.data.message);

    if (response.data.status_code !== 200) {
      return res
        .status(200)
        .json({ success: false, message: response.data.message });
    }
    // If OTP is successfully verified, update the document in UserVerification collection
    const updatedDoc = await UserVerification.findByIdAndUpdate(
      newId, // Document ID to update
      {
        $set: {
          aadhaar_response: response.data,
          all_verified: 1,
        },
      },
      { new: true } // Option to return the updated document
    );

    // Send response back to client with the updated document
    return res.status(200).json({
      success: true,
      message:
        "Aadhaar verification is complete. You can check the details in the Download Center",
      data: response.data,
      updatedDoc: updatedDoc,
    });
  } catch (error) {
    console.error(
      "Error verifying OTP:",
      error.response?.data || error.message
    );

    // Send error response to client in case of failure
    return res
      .status(500)
      .json({ success: false, error: error.response?.data || error.message });
  }
};

export const paynow = async (req, res) => {
  try {
    const employer_id = req.userId;

    if (!employer_id) {
      return res.status(400).json({ error: "User ID is missing." });
    }

    const {
      razorpay_response,
      amount,
      paymentIds,
      payment_method,
      overall_billing,
    } = req.body;

    if (!amount || !payment_method) {
      return res.status(400).json({ error: "Payment details are incomplete." });
    }

    const user = await User.findById(employer_id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (payment_method === "Wallet") {
      if (!user.wallet_amount || user.wallet_amount < amount) {
        return res.status(400).json({ error: "Insufficient wallet balance." });
      }
      user.wallet_amount -= amount;
      await user.save();
    } else if (payment_method === "online") {
      if (!razorpay_response?.razorpay_payment_id) {
        return res
          .status(400)
          .json({ error: "Razorpay payment ID is missing." });
      }
    } else {
      return res.status(400).json({ error: "Invalid payment method." });
    }

    // Add all data in Orders Table
    //const moment = require('moment');
    // Get current date and time
    //const now = ${Date.now()};
    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNo();

    const newUserCart = new allOrdersData({
      employer_id: employer_id,
      order_number: orderNumber,
      invoice_number: invoiceNumber,
      subtotal: overall_billing.subtotal,
      cgst: overall_billing.cgst,
      cgst_percent: overall_billing.cgst_percent,
      sgst: overall_billing.sgst,
      sgst_percent: overall_billing.sgst_percent,
      total_amount: overall_billing.total,
      discount_percent: overall_billing.discount_percent,
      discount_amount: overall_billing.discount,
      total_numbers_users: overall_billing.total_verifications,
    });

    const savedCart = await newUserCart.save();
    const insertedId = savedCart._id;

    // Update is_paid field
    const updatedUsers = await UserCartVerification.updateMany(
      { employer_id: employer_id },
      { $set: { is_paid: 1, createdAt: new Date(), order_ref_id: insertedId } }
    );

    if (updatedUsers.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No users found for this employer" });
    }

    // Fetch all cart items for this order
    const cartItems = await UserCartVerification.find({
      employer_id,
      order_ref_id: insertedId,
    });

    // Generate order details table
    const orderDetailsTable = cartItems
      .map((item, index) => {
        let payFor = [];

        if (item.pan_number) payFor.push("PAN");
        if (item.aadhar_number) payFor.push("Aadhar");
        if (item.dl_number) payFor.push("Driving Licence");
        if (item.passport_file_number) payFor.push("Passport");
        if (item.epic_number) payFor.push("EPIC");
        if (item.uan_number) payFor.push("UAN");

        const selectedVerifications = payFor.join(", ");

        return `
    <tr>
      <td style="text-align: center;">${index + 1}</td>
      <td style="text-align: center;">${item.candidate_name}</td>
      <td style="text-align: center;">${item.candidate_email}</td>
      <td style="text-align: center;">${selectedVerifications}</td>
    </tr>
  `;
      })
      .join("");

    const emailTable = `
      <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Candidate Name</th>
            <th>Candidate Email</th>
            <th>Paid for</th>
          </tr>
        </thead>
        <tbody>
          ${orderDetailsTable}
        </tbody>
      </table>
    `;

    const usersToArchive = await UserCartVerification.find({
      employer_id: employer_id,
      is_paid: 1,
    });

    if (usersToArchive.length === 0) {
      return res.status(404).json({ message: "No updated users to archive" });
    }

    // ✅ Generate and assign order_id to each record
    const orderPrefix = `ORD-${Date.now()}`;
    const usersWithOrderId = usersToArchive.map((user, index) => {
      const obj = user.toObject();
      obj.order_id = `${orderPrefix}-${index + 1}`;
      delete obj._id; // Remove _id so MongoDB can generate a new one
      return obj;
    });

    await UserVerification.insertMany(usersWithOrderId);

    const userIds = usersToArchive.map((user) => user._id);

    await UserCartVerification.deleteMany({
      employer_id: employer_id,
      is_paid: 1,
    });

    const transaction = new Transaction({
      employer_id: employer_id,
      order_ref_id: insertedId,
      transactionId:
        payment_method === "online"
          ? razorpay_response.razorpay_payment_id
          : `wallet_${Date.now()}`,
      amount: amount,
      paymentids: paymentIds || null,
      order_ids: userIds.join(","),
      payment_method: payment_method,
      payment_type: "debit",
    });

    await transaction.save();

    // Send email with login credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true, // true for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Order Confirmation : QuikChek - Thank You for Your Purchase!",
      html: `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Thank you for shopping with QuikChek. We have successfully received your order, and it's now being processed.</p>
        <p><strong>Order Details:</strong></p>
        <p>Order Number: #${orderNumber}</p>
        <p>Payment Amount: #${overall_billing.total}</p>
        <p>Payment Method: Online</p>

        <p>Thank you for shopping with QuikChek. Here are your order details:</p>
        ${emailTable}
      
        <p>If you have any questions or need further assistance, feel free to reach out to our support team at support@quikchek.in or call us at 8697744701.</p>
        <p>Thank you for choosing QuikChek. We appreciate your trust in us and look forward to serving you again.</p>
        <br />
        <p>Sincerely,<br />
        The Admin Team<br />
        <strong>Global Employability Information Services India Limited</strong></p>

        <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    const mailOptions2 = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Payment Received: QuikChek - Your Order is Confirmed!",
      html: `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Thank you for your payment! We are pleased to inform you that your payment for Order #${orderNumber} has been successfully processed.</p>
       
        <p>Thank you for shopping with QuikChek. Here are your order details:</p>
        ${emailTable}
      
        <p>If you have any questions or need further assistance, feel free to reach out to our support team at support@quikchek.in or call us at 8697744701.</p>
        <p>Thank you for choosing QuikChek. We appreciate your trust in us and look forward to serving you again.</p>
        <br />
        <p>Sincerely,<br />
        The Admin Team<br />
        <strong>Global Employability Information Services India Limited</strong></p>

                <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
      `,
    };

    await transporter.sendMail(mailOptions2);

    const mailOptions3 = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: "kp.sunit@gmail.com",
      subject:
        "Payment Received: QuikChek - " +
        user.name +
        " Has Paid for Order #" +
        orderNumber,
      cc: ["kp.sunit@gmail.com", "avik@2sglobal.co", "dipanwita@2sglobal.co"],
      html: `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
    </div>

    <p>Dear <strong>Admin</strong>,</p>

    <p>We are pleased to inform you that <strong>${user.name}</strong> has successfully completed the payment for <strong>Order #${orderNumber}</strong> via QuikChek.
    Amount: <strong>₹ ${amount}</strong>
    </p>

    <p>Below are the order details:</p>
    ${emailTable}

    <p>Please process the order accordingly and ensure timely delivery/service.</p>

    <p>If you need any assistance, feel free to contact us at <a href="mailto:support@quikchek.in">support@quikchek.in</a> or call <strong>8697744701</strong>.</p>

    <p>Thank you for being a part of the QuikChek team!</p>

    <br />
    <p>Sincerely,<br />
    The Admin Team<br />
    <strong>Global Employability Information Services India Limited</strong></p>

    <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
  `,
    };

    await transporter.sendMail(mailOptions3);

    return res.status(200).json({
      message:
        "Payment processed, verifications archived, and transaction recorded",
      archivedUsersCount: usersWithOrderId.length,
      remainingWalletBalance: user.wallet_amount,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({
      message: "Error processing payment22",
      error: error.message,
    });
  }
};

export const paynowFree = async (req, res) => {
  try {
    const employer_id = req.userId;

    if (!employer_id) {
      return res.status(400).json({ error: "User ID is missing." });
    }

    const { amount, paymentIds, payment_method, overall_billing } = req.body;

    /*     if (!amount || !payment_method) {
      return res.status(400).json({ error: "Payment details are incomplete." });
    } */

    const user = await User.findById(employer_id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (payment_method === "Wallet") {
      if (!user.wallet_amount || user.wallet_amount < amount) {
        return res.status(400).json({ error: "Insufficient wallet balance." });
      }
      user.wallet_amount -= amount;
      await user.save();
    } else if (payment_method === "Free") {
    } else {
      return res.status(400).json({ error: "Invalid payment method." });
    }

    // Add all data in Orders Table
    //const moment = require('moment');
    // Get current date and time
    //const now = ${Date.now()};
    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNo();

    const newUserCart = new allOrdersData({
      employer_id: employer_id,
      order_number: orderNumber,
      invoice_number: invoiceNumber,
      subtotal: overall_billing.subtotal,
      cgst: overall_billing.cgst,
      cgst_percent: overall_billing.cgst_percent,
      sgst: overall_billing.sgst,
      sgst_percent: overall_billing.sgst_percent,
      total_amount: overall_billing.total,
      discount_percent: overall_billing.discount_percent,
      discount_amount: overall_billing.discount,
      total_numbers_users: overall_billing.total_verifications,
    });

    const savedCart = await newUserCart.save();
    const insertedId = savedCart._id;

    // Update is_paid field
    const updatedUsers = await UserCartVerification.updateMany(
      { employer_id: employer_id },
      { $set: { is_paid: 1, createdAt: new Date(), order_ref_id: insertedId } }
    );

    if (updatedUsers.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No users found for this employer" });
    }

    // Fetch all cart items for this order
    const cartItems = await UserCartVerification.find({
      employer_id,
      order_ref_id: insertedId,
    });

    // Generate order details table
    const orderDetailsTable = cartItems
      .map((item, index) => {
        let payFor = [];

        if (item.pan_number) payFor.push("PAN");
        if (item.aadhar_number) payFor.push("Aadhar");
        if (item.dl_number) payFor.push("Driving Licence");
        if (item.passport_file_number) payFor.push("Passport");
        if (item.epic_number) payFor.push("EPIC");
        if (item.uan_number) payFor.push("UAN");

        const selectedVerifications = payFor.join(", ");

        return `
    <tr>
      <td style="text-align: center;">${index + 1}</td>
      <td style="text-align: center;">${item.candidate_name}</td>
      <td style="text-align: center;">${item.candidate_email}</td>
      <td style="text-align: center;">${selectedVerifications}</td>
    </tr>
  `;
      })
      .join("");

    const emailTable = `
      <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Candidate Name</th>
            <th>Candidate Email</th>
            <th>Paid for</th>
          </tr>
        </thead>
        <tbody>
          ${orderDetailsTable}
        </tbody>
      </table>
    `;

    const usersToArchive = await UserCartVerification.find({
      employer_id: employer_id,
      is_paid: 1,
    });

    if (usersToArchive.length === 0) {
      return res.status(404).json({ message: "No updated users to archive" });
    }

    // ✅ Generate and assign order_id to each record
    const orderPrefix = `ORD-${Date.now()}`;
    const usersWithOrderId = usersToArchive.map((user, index) => {
      const obj = user.toObject();
      obj.order_id = `${orderPrefix}-${index + 1}`;
      delete obj._id; // Remove _id so MongoDB can generate a new one
      return obj;
    });

    await UserVerification.insertMany(usersWithOrderId);

    const userIds = usersToArchive.map((user) => user._id);

    await UserCartVerification.deleteMany({
      employer_id: employer_id,
      is_paid: 1,
    });

    const transaction = new Transaction({
      employer_id: employer_id,
      order_ref_id: insertedId,
      transactionId: "",
      amount: amount,
      paymentids: paymentIds || null,
      order_ids: userIds.join(","),
      payment_method: payment_method,
      payment_type: "debit",
    });

    await transaction.save();

    // Send email with login credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true, // true for port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Order Confirmation : QuikChek - Thank You for Your Purchase!",
      html: `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Thank you for shopping with QuikChek. We have successfully received your order, and it's now being processed.</p>
        <p><strong>Order Details:</strong></p>
        <p>Order Number: #${orderNumber}</p>
        <p>Payment Amount: #${overall_billing.total}</p>
        <p>Payment Method: Online</p>

        <p>Thank you for shopping with QuikChek. Here are your order details:</p>
        ${emailTable}
      
        <p>If you have any questions or need further assistance, feel free to reach out to our support team at support@quikchek.in or call us at 8697744701.</p>
        <p>Thank you for choosing QuikChek. We appreciate your trust in us and look forward to serving you again.</p>
        <br />
        <p>Sincerely,<br />
        The Admin Team<br />
        <strong>Global Employability Information Services India Limited</strong></p>

        <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    const mailOptions2 = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Payment Received: QuikChek - Your Order is Confirmed!",
      html: `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Thank you for your payment! We are pleased to inform you that your payment for Order #${orderNumber} has been successfully processed.</p>
       
        <p>Thank you for shopping with QuikChek. Here are your order details:</p>
        ${emailTable}
      
        <p>If you have any questions or need further assistance, feel free to reach out to our support team at support@quikchek.in or call us at 8697744701.</p>
        <p>Thank you for choosing QuikChek. We appreciate your trust in us and look forward to serving you again.</p>
        <br />
        <p>Sincerely,<br />
        The Admin Team<br />
        <strong>Global Employability Information Services India Limited</strong></p>

                <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
      `,
    };

    await transporter.sendMail(mailOptions2);

    const mailOptions3 = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: "kp.sunit@gmail.com",
      subject:
        "Payment Received: QuikChek - " +
        user.name +
        " Has Paid for Order #" +
        orderNumber,
      cc: ["kp.sunit@gmail.com", "avik@2sglobal.co", "dipanwita@2sglobal.co"],
      html: `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
    </div>

    <p>Dear <strong>Admin</strong>,</p>

    <p>We are pleased to inform you that <strong>${user.name}</strong> has successfully completed the payment for <strong>Order #${orderNumber}</strong> via QuikChek.
    Amount: <strong>₹ ${amount}</strong>
    </p>

    <p>Below are the order details:</p>
    ${emailTable}

    <p>Please process the order accordingly and ensure timely delivery/service.</p>

    <p>If you need any assistance, feel free to contact us at <a href="mailto:support@quikchek.in">support@quikchek.in</a> or call <strong>8697744701</strong>.</p>

    <p>Thank you for being a part of the QuikChek team!</p>

    <br />
    <p>Sincerely,<br />
    The Admin Team<br />
    <strong>Global Employability Information Services India Limited</strong></p>

    <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
  `,
    };

    await transporter.sendMail(mailOptions3);

    return res.status(200).json({
      message:
        "Payment processed, verifications archived, and transaction recorded",
      archivedUsersCount: usersWithOrderId.length,
      remainingWalletBalance: user.wallet_amount,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({
      message: "Error processing payment22",
      error: error.message,
    });
  }
};

export const resendAadharOTPFree = async (req, res) => {
  try {
    const employer_id = req.userId;

    if (!employer_id) {
      return res.status(400).json({ error: "User ID is missing." });
    }

    // Get the last archived verification by employer
    const archivedUser = await UserVerification.findOne({
      employer_id,
      is_del: false, // ensure only active (not deleted) records are used
    })
      .sort({ createdAt: -1 }) // get the latest one
      .lean();

    if (!archivedUser) {
      return res.status(404).json({ message: "No verification data found to resend OTP." });
    }

    const aadhaarNumber = archivedUser.aadhar_number;
    const nameToMatch = archivedUser.aadhar_name;
    const newId = archivedUser._id; // Extract newId from existing document

    if (!aadhaarNumber || !nameToMatch) {
      return res.status(400).json({ message: "Missing Aadhaar details for resend." });
    }

    // Prepare payload for OTP resend
    const payload = {
      key: "0196b58f-2f35-4c99-b219-aa8339013476",
      id_number: aadhaarNumber,
    };

    const headers = {
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      "https://api.quickekyc.com/api/v1/aadhaar-v2/generate-otp",
      payload,
      { headers }
    );

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      aadhar_response: response.data,
      newId: newId
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({
      message: "Error resending OTP",
      error: error.message,
    });
  }
};