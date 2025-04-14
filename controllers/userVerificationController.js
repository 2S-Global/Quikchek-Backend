import UserCartVerification from "../models/userVerificationCartModel.js";
import UserVerification from "../models/userVerificationModel.js";
import mongoose from "mongoose";
import axios from "axios";

import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";


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
const users = await UserVerification.find({ employer_id, all_verified: 1 })
  .sort({ createdAt: -1 });

res.status(200).json(users);
  } catch (error) {
      console.error("Error fetching verified users:", error);
      res.status(500).json({ message: error.message });
  }
};
export const verifyPAN = async (req, res) => {
    try {
      const { customer_pan_number, pan_holder_name,id } = req.body;
      const employer_id = req.userId;
      if (!employer_id) {
        return res.status(400).json({ message: "Employer ID is required" });
    }
      if (!customer_pan_number || !pan_holder_name) {
        return res.status(400).json({ message: "PAN number and name are required" });
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
        "https://test.zoop.one/api/v1/in/identity/pan/lite",
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
         
            }
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

      
      const { customer_epic_number, name_to_match,id } = req.body;

      const employer_id = req.userId;
      if (!employer_id) {
        return res.status(400).json({ message: "Employer ID is required" });
    }
  
      if (!customer_epic_number || !name_to_match) {
        return res.status(400).json({ message: "EPIC number and name are required" });
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
        "https://test.zoop.one/api/v1/in/identity/voter/advance",
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
 
          }
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
      const { customer_aadhaar_number,id } = req.body;
  
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
            "I hereby declare my consent agreement for fetching my information via ZOOP API"
        },
        task_id: "ecc326d9-d676-4b10-a82b-50b4b9dd8a16"
      };
  
 
      const response = await axios.post(
        "https://test.zoop.one/api/v1/in/identity/aadhaar/verification",
        aadhaarData,
        {
          headers: {
            "app-id": "67b8252871c07100283cedc6",
            "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
            "Content-Type": "application/json"
          },
          timeout: 10000, // 10 seconds timeout
          maxRedirects: 10
        }
      );

      // const response =hello;
  
      const aadhaarApiResponse = response.data;
  
      const updatedUser = await UserVerification.findByIdAndUpdate(
        id,
        {
          $set: {
            aadhaar_response: aadhaarApiResponse,

          }
        },
        { new: true } 
      );
      // res.status(200);
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({
        message: "Aadhaar verification failed",
        error: error.response ? error.response.data : error.message
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
        res.status(500).json({ message: "Error moving record", error: error.message });
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
      all_verified: 1,  // ✅ Only verified users
      is_del: false,     // ✅ Exclude deleted users
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
    const { customer_file_number, name_to_match, customer_dob ,id } = req.body;

    if (!customer_file_number || !name_to_match || !customer_dob) {
      return res.status(400).json({ message: "Passport number and name are required" });
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
      "https://test.zoop.one/api/v1/in/identity/passport/advance",
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
            status:"1"
          }
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
    const { customer_dl_number, name_to_match, customer_dob,id } = req.body;

    if (!customer_dl_number || !name_to_match || !customer_dob) {
      return res.status(400).json({ message: "DL number, name, and DOB are required" });
    }

    const dlData = {
      mode: "sync",
      data: {
        customer_dl_number,
        name_to_match,
        customer_dob,
        consent: "Y",
        consent_text:
          "I hereby declare my consent agreement for fetching my information via ZOOP API"
      },
      task_id: "f26eb21e-4c35-4491-b2d5-41fa0e545a34"
    };


    const response = await axios.post(
      "https://test.zoop.one/api/v1/in/identity/dl/advance",
      dlData,
      {
        headers: {
          "app-id": "67b8252871c07100283cedc6",
          "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW",
          "Content-Type": "application/json"
        },
        timeout: 10000, // 10 seconds timeout
        maxRedirects: 10
      }
    );

    const dlApiResponse = response.data;

    const updatedUser = await UserCartVerification.findByIdAndUpdate(
      id,
      {
        $set: {
          dl_response: dlApiResponse,
      
        }
      },
      { new: true } 
    );


    res.status(200).json(response.data);
        // res.status(200);
  } catch (error) {
    res.status(500).json({
      message: "DL verification failed",
      error: error.response ? error.response.data : error.message
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

  const { razorpay_response , amount  , paymentIds} = req.body;
  

  if (!razorpay_response?.razorpay_payment_id || !amount ) {
      return res.status(400).json({ error: "Incomplete payment details." });
  }

 
  

    // Step 1: Update the 'is_paid' field to 1 for all records of this employer
    const updatedUsers = await UserCartVerification.updateMany(
      { employer_id: employer_id },
      { $set: { is_paid: 1,createdAt: new Date()  } }
    );

    if (updatedUsers.nModified === 0) {
      return res.status(404).json({ message: "No users found for this employer" });
    }

    // Step 2: Insert the updated records into the 'ArchivedUserCartVerification' table
    const usersToArchive = await UserCartVerification.find({ employer_id: employer_id, is_paid: 1 });

    if (usersToArchive.length === 0) {
      return res.status(404).json({ message: "No updated users to archive" });
    }

    // Insert the updated records into the archived collection
    await UserVerification.insertMany(usersToArchive);

    const userIds = usersToArchive.map(user => user._id);


    // Step 3: Optionally, delete the records from the original collection (if you want to move them)
    await UserCartVerification.deleteMany({ employer_id: employer_id, is_paid: 1 });
    // Save transaction
    const transaction = new Transaction({
    employer_id: employer_id,
    transactionId: razorpay_response.razorpay_payment_id,
    amount: amount,
    paymentids: paymentIds,
    order_ids: userIds.join(','),
      });

await transaction.save();
console.log("Transaction saved:", transaction);
    return res.status(200).json({
      message: "Payment status updated, records archived, and original records deleted",
      archivedUsersCount: UserVerification.length,
    });
    
  } catch (error) {
    return res.status(500).json({
      message: "Error processing payment",
      error: error.message,
    });
  }
};



export const paynow = async (req, res) => {
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
    } else if (payment_method === "Live") {
      if (!razorpay_response?.razorpay_payment_id) {
        return res.status(400).json({ error: "Razorpay payment ID is missing." });
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
      return res.status(404).json({ message: "No users found for this employer" });
    }

    // Step 2: Insert the updated records into the archived collection
    const usersToArchive = await UserCartVerification.find({ employer_id: employer_id, is_paid: 1 });

    if (usersToArchive.length === 0) {
      return res.status(404).json({ message: "No updated users to archive" });
    }

    await UserVerification.insertMany(usersToArchive);

    const userIds = usersToArchive.map(user => user._id);

    // Step 3: Delete original records
    await UserCartVerification.deleteMany({ employer_id: employer_id, is_paid: 1 });

    // Step 4: Save transaction
    const transaction = new Transaction({
      employer_id: employer_id,
      transactionId: payment_method === "Live" ? razorpay_response.razorpay_payment_id : `wallet_${Date.now()}`,
      amount: amount,
      paymentids: paymentIds || null,
      order_ids: userIds.join(','),
      payment_method: payment_method,
      payment_type: "debit",
    });

    await transaction.save();

    return res.status(200).json({
      message: "Payment processed, verifications archived, and transaction recorded",
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




function convertDateFormat(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
}
  
export const verifyDataBackground = async (req, res) => {
  try {
    // Fetch only one user that needs verification
    const userCart = await UserVerification.findOne({ is_paid: 1, is_del: false, all_verified: 0 });

    if (!userCart) {
      console.log("No users left for verification.");
      return res.status(200).json({ message: "No users left for verification." });
    }

    const currentUserID = userCart._id;

    console.log(userCart._id,' == >>>> ',userCart.candidate_name);
    // Function to introduce a delay
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // PAN verification
    if (userCart.pan_number && !userCart.pan_response) {
      const panData = {
        mode: "sync",
        data: {
          customer_pan_number: userCart.pan_number,
          pan_holder_name: userCart.pan_name,
          consent: "Y",
          consent_text: "I hereby declare my consent agreement for fetching my information via ZOOP API",
        },
        task_id: "8bbb54f3-d299-4535-b00e-e74d2d5a3997",
      };

      const response = await axios.post(
        "https://test.zoop.one/api/v1/in/identity/pan/lite",
        panData,
        { headers: { "app-id": "67b8252871c07100283cedc6", "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW", "Content-Type": "application/json" } }
      );

      await UserVerification.findByIdAndUpdate(currentUserID, { $set: { pan_response: response.data } }, { new: true });
      await delay(2000); // Wait 2 seconds before the next API call
    }

    // Aadhaar verification
    if (userCart.aadhar_number && !userCart.aadhaar_response) {
      const aadhaarData = {
        mode: "sync",
        data: {
          customer_aadhaar_number: userCart.aadhar_number,
          consent: "Y",
          consent_text: "I hereby declare my consent agreement for fetching my information via ZOOP API",
        },
        task_id: "ecc326d9-d676-4b10-a82b-50b4b9dd8a16",
      };

      const response = await axios.post(
        "https://test.zoop.one/api/v1/in/identity/aadhaar/verification",
        aadhaarData,
        { headers: { "app-id": "67b8252871c07100283cedc6", "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW", "Content-Type": "application/json" } }
      );

      await UserVerification.findByIdAndUpdate(currentUserID, { $set: { aadhaar_response: response.data } }, { new: true });
      await delay(2000);
    }

    // Driving License verification
    if (userCart.dl_number && !userCart.dl_response) {
      const dlData = {
        mode: "sync",
        data: {
          customer_dl_number: userCart.dl_number,
          name_to_match: userCart.dl_name,
          customer_dob: convertDateFormat(userCart.candidate_dob),
          consent: "Y",
          consent_text: "I hereby declare my consent agreement for fetching my information via ZOOP API",
        },
        task_id: "f26eb21e-4c35-4491-b2d5-41fa0e545a34",
      };

      const response = await axios.post(
        "https://test.zoop.one/api/v1/in/identity/dl/advance",
        dlData,
        { headers: { "app-id": "67b8252871c07100283cedc6", "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW", "Content-Type": "application/json" } }
      );

      await UserVerification.findByIdAndUpdate(currentUserID, { $set: { dl_response: response.data } }, { new: true });
      await delay(2000);
    }

    // Passport verification
    if (userCart.passport_file_number && !userCart.passport_response) {
      const passportData = {
        mode: "sync",
        data: {
          customer_file_number: userCart.passport_file_number,
          name_to_match: userCart.passport_name,
          customer_dob: convertDateFormat(userCart.candidate_dob),
          consent: "Y",
          consent_text: "I hereby declare my consent agreement for fetching my information via ZOOP API",
        },
        task_id: "8bbb54f3-d299-4535-b00e-e74d2d5a3997",
      };

  //console.log(passportData);

      const response = await axios.post(
        "https://test.zoop.one/api/v1/in/identity/passport/advance",
        passportData,
        { headers: { "app-id": "67b8252871c07100283cedc6", "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW", "Content-Type": "application/json" } }
      );

      await UserVerification.findByIdAndUpdate(currentUserID, { $set: { passport_response: response.data } }, { new: true });
      await delay(2000);
    }

    // EPIC (Voter ID) verification
    if (userCart.epic_number && !userCart.epic_response) {
      const epicData = {
        data: {
          customer_epic_number: userCart.epic_number,
          name_to_match: userCart.epic_name,
          consent: "Y",
          consent_text: "I hereby declare my consent agreement for fetching my information via ZOOP API",
        },
        task_id: "d15a2a3b-9989-46ef-9b63-e24728292dc0",
      };

      const response = await axios.post(
        "https://test.zoop.one/api/v1/in/identity/voter/advance",
        epicData,
        { headers: { "app-id": "67b8252871c07100283cedc6", "api-key": "52HD084-W614E0Q-JQY5KJG-R8EW1TW", "Content-Type": "application/json" } }
      );

      await UserVerification.findByIdAndUpdate(currentUserID, { $set: { epic_response: response.data } }, { new: true });
      await delay(2000);
    }

    /////UAN VERIFICATION
      if (userCart.uan_number && !userCart.uan_response) {

     const data = {
      mode: 'sync',
      data: {
        customer_uan_number: userCart.uan_number,
        consent: 'Y',
        consent_text: 'I consent to this information being shared with zoop.one.',
      },
      task_id: 'ecc326d9-d676-4b10-a82b-50b4b9dd8a16',
    };

    const response = await axios.post(
      'https://test.zoop.one/api/v1/in/identity/uan/advance',
      data,
      {
        headers: {
          'app-id': '67b8252871c07100283cedc6',
          'api-key': '52HD084-W614E0Q-JQY5KJG-R8EW1TW',
          'Content-Type': 'application/json',
        },
      }
        );
     await UserVerification.findByIdAndUpdate(currentUserID, { $set: { uan_response: response.data } }, { new: true });
      await delay(2000);
      }

    ///Epfo Verification
    if(userCart.epfo_number && !userCart.epfo_response){
    const data = {
      mode: 'sync',
      data: {
        customer_phone_number: '9051624898',
        consent: 'Y',
        consent_text: 'I hereby declare my consent agreement for fetching my information via ZOOP API',
      },
      task_id: '9791f6f3-3106-4385-b2f0-5d391f1463cb',
    };

    const response = await axios.post(
      'https://test.zoop.one/api/v1/in/identity/epfo/pro',
      data,
      {
        headers: {
          'app-id': '67b8252871c07100283cedc6',
          'api-key': '52HD084-W614E0Q-JQY5KJG-R8EW1TW',
          'Content-Type': 'application/json',
        },
      }
    );
   await UserVerification.findByIdAndUpdate(currentUserID, { $set: { epfo_response: response.data } }, { new: true });
      await delay(2000);
    }
    

    // After all verifications are done, update all_verified to 1
    await UserVerification.findByIdAndUpdate(currentUserID, { $set: { all_verified: 1 } }, { new: true });

    return res.status(200).json({ message: "Verification completed successfully for one user." });

  } catch (error) {
    console.error("Error fetching records:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

  export const verifyUan = async (req, res) => {
  try {
    const data = {
      mode: 'sync',
      data: {
        customer_uan_number: '100003213093',
        consent: 'Y',
        consent_text: 'I consent to this information being shared with zoop.one.',
      },
      task_id: 'ecc326d9-d676-4b10-a82b-50b4b9dd8a16',
    };

    const response = await axios.post(
      'https://test.zoop.one/api/v1/in/identity/uan/advance',
      data,
      {
        headers: {
          'app-id': '67b8252871c07100283cedc6',
          'api-key': '52HD084-W614E0Q-JQY5KJG-R8EW1TW',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(response.data);

    // Send response back to client
    return res.status(200).json(response.data);

  } catch (error) {
    console.error('Error verifying UAN:', error?.response?.data || error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const verifyEpfo = async (req, res) => {
  try {
    const data = {
      mode: 'sync',
      data: {
        customer_phone_number: '9051624898',
        consent: 'Y',
        consent_text: 'I hereby declare my consent agreement for fetching my information via ZOOP API',
      },
      task_id: '9791f6f3-3106-4385-b2f0-5d391f1463cb',
    };

    const response = await axios.post(
      'https://test.zoop.one/api/v1/in/identity/epfo/pro',
      data,
      {
        headers: {
          'app-id': '67b8252871c07100283cedc6',
          'api-key': '52HD084-W614E0Q-JQY5KJG-R8EW1TW',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('EPFO Response:', response.data);

    // ✅ Send response to client
    return res.status(200).json({ success: true, data: response.data });

  } catch (error) {
    console.error('Error verifying EPFO:', error.response?.data || error.message);

    // ✅ Send error response to client
    return res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
};

