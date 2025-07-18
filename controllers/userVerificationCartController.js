import UserCartVerification from "../models/userVerificationCartModel.js";
import UserCartVerificationAadhatOTP from "../models/userVerificationCartAadhatOTPModel.js";
import UserVerification from "../models/userVerificationModel.js";
import User from "../models/userModel.js";
import Package from "../models/packageModel.js";
import CompanyPackage from "../models/companyPackageModel.js";
import allOrdersData from "../models/allOrders.js";
import mongoose from "mongoose";
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
// Register a new user



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getResourceType = (mimetype) => {
  return 'auto'; // Always return 'auto'
};

// Function to upload to Cloudinary
export const uploadToCloudinary = async (fileBuffer, originalName, mimetype) => {
  const resourceType = getResourceType(mimetype); // Always returns 'auto'
  const extension = path.extname(originalName).slice(1).toLowerCase() || ''; // Extract extension

  // Log inputs for debugging
  // console.log('Uploading to Cloudinary:', { originalName, mimetype, resourceType, extension });

  // Generate a unique public_id with extension for all resources
  // const publicId = `${uuidv4()}_${Date.now()}.${extension || 'pdf'}`; 

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'user_verification_documents',
          resource_type: resourceType,
          // public_id: publicId,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(fileBuffer);
    });

  
    return result.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export const addUserToCart = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const { plan, name, email, phone, dob, address, gender, panname, pannumber, pandoc, aadhaarname, aadhaarnumber, aadhaardoc, licensename, licensenumber, licensenumdoc, passportname, passportnumber, passportdoc, votername, voternumber, voterdoc, additionalfields, uannumber, uanname, uandoc } = req.body;

      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      const aadhaarRegex = /^\d{12}$/;
      const dlRegex = /^[A-Z]{2}\d{2}\d{11}$/;
      const epicRegex = /^[A-Z]{3}[0-9]{7}$/;
      const uanRegex = /^\d{12}$/;


          // Validate PAN
      if (pannumber && !panRegex.test(pannumber)) {
        return res.status(200).json({ success: false, message: "Invalid PAN number format." });
      }
      
      // Validate Aadhaar
      if (aadhaarnumber && !aadhaarRegex.test(aadhaarnumber)) {
        return res.status(200).json({ success: false, message: "Invalid Aadhaar number format." });
      }
      
      // Validate DL
      if (licensenumber && !dlRegex.test(licensenumber)) {
        return res.status(200).json({ success: false, message: "Invalid Driving License number format." });
      }
      
      // Validate EPIC
      if (voternumber && !epicRegex.test(voternumber)) {
        return res.status(200).json({ success: false, message: "Invalid Voter ID (EPIC) number format." });
      }
      
      // Validate UAN
      if (uannumber && !uanRegex.test(uannumber)) {
        return res.status(200).json({ success: false, message: "Invalid UAN number format." });
      }

    
    // Upload documents to Cloudinary
const panImageUrl = req.files?.pandoc
      ? await uploadToCloudinary(
          req.files.pandoc[0].buffer,
          req.files.pandoc[0].originalname,
          req.files.pandoc[0].mimetype
        )
      : null;

    const aadharImageUrl = req.files?.aadhaardoc
      ? await uploadToCloudinary(
          req.files.aadhaardoc[0].buffer,
          req.files.aadhaardoc[0].originalname,
          req.files.aadhaardoc[0].mimetype
        )
      : null;

    const dlImageUrl = req.files?.licensedoc
      ? await uploadToCloudinary(
          req.files.licensedoc[0].buffer,
          req.files.licensedoc[0].originalname,
          req.files.licensedoc[0].mimetype
        )
      : null;

    const passportImageUrl = req.files?.doc
      ? await uploadToCloudinary(
          req.files.doc[0].buffer,
          req.files.doc[0].originalname,
          req.files.doc[0].mimetype
        )
      : null;

    const epicImageUrl = req.files?.voterdoc
      ? await uploadToCloudinary(
          req.files.voterdoc[0].buffer,
          req.files.voterdoc[0].originalname,
          req.files.voterdoc[0].mimetype
        )
      : null;

      const uanImageUrl = req.files?.uandoc
      ? await uploadToCloudinary(
          req.files.uandoc[0].buffer,
          req.files.uandoc[0].originalname,
          req.files.uandoc[0].mimetype
        )
      : null;  

      const packagedetails = await Package.findById(plan);    
      if (!packagedetails) {
      return res.status(200).json({ success: false, message: "Package Not Found.." });
      }
      const verificationamount = parseFloat(packagedetails.transaction_fee || 0);

    const newUserCart = new UserCartVerification({
      employer_id: user_id,
      plan: plan,
      amount: verificationamount,
      candidate_name: name,
      candidate_email: email,
      candidate_mobile: phone,
      candidate_dob: dob,
      candidate_address: address,
      candidate_gender: gender,
      pan_name: panname,
      pan_number: pannumber,
      pan_image: panImageUrl,
      aadhar_name: aadhaarname,
      aadhar_number: aadhaarnumber,
      aadhar_image: aadharImageUrl,
      dl_name: licensename,
      dl_number: licensenumber,
      dl_image: dlImageUrl,
      passport_name: passportname,
      passport_file_number: passportnumber,
      passport_image: passportImageUrl,
      epic_name: votername,
      epic_number: voternumber,
      epic_image: epicImageUrl,
      additionalfields: additionalfields,
      uan_number: uannumber,
      uan_name: uanname,
      uan_image: uanImageUrl,
    });

    await newUserCart.save();
    res.status(201).json({ success: true, message: "User verification cart added successfully", data: newUserCart });
  } catch (error) {
    console.error("Error adding user to cart:", error);
    res.status(401).json({ success: false, message: "Error adding user verification cart", error: error.message });
  }
};




export const addUserToCartAadharOTP = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }


    
    const companyPackage = await CompanyPackage.findOne({
      companyId: user_id,
      is_del: false,
    });

    if (!companyPackage || companyPackage.aadhar_otp !== "enable") {
      return res.status(200).json({
        success: false,
        message: "Aadhar OTP verification is not enabled for this company.",
      });
    }

    
      // ✅ Check for existing unpaid cart
  const existingCart = await UserCartVerificationAadhatOTP.findOne({
    employer_id: user_id,
    is_paid: 0,
    });
  
    if (existingCart) {
    return res.status(200).json({
    success: false,
    message: "A cart already exists for this user. Please complete the payment before adding a new one.",
    });
    }

    const { name, email, phone, dob, address, gender, aadhar_name, aadhar_number, aadhaardoc } = req.body;

    // Upload documents to Cloudinary


    const aadharImageUrl = req.files?.aadhaardoc
      ? await uploadToCloudinary(
          req.files.aadhaardoc[0].buffer,
          req.files.aadhaardoc[0].originalname,
          req.files.aadhaardoc[0].mimetype
        )
      : null;



    const newUserCart = new UserCartVerificationAadhatOTP({
      employer_id: user_id,
      candidate_name: name,
      candidate_email: email,
      candidate_mobile: phone,
      candidate_dob: dob,
      candidate_address: address,
      candidate_gender: gender,
      aadhar_name: aadhar_name,
      aadhar_number: aadhar_number,
      aadhar_image: aadharImageUrl,
    });

    await newUserCart.save();
    res.status(201).json({ success: true, message: "User verification cart added successfully", data: newUserCart });
  } catch (error) {
    console.error("Error adding user to cart:", error);
    res.status(401).json({ success: false, message: "Error adding user verification cart", error: error.message });
  }
};


export const getCartDetailsAadhatOTP = async (req, res) => {
  try {
      const employer_id = req.userId;
       const employer = await User.findOne({ _id: employer_id, role: 1, is_del: false });
        if (!employer) {
          return res.status(404).json({ success: false, message: "Employer not found" });
      }
      const userCarts = await UserCartVerificationAadhatOTP.find({ employer_id, is_del: false });

      const discountPercentData = await CompanyPackage.findOne({ companyId: employer_id});


       const verificationCharge = parseFloat(discountPercentData.aadhar_price || 0);
      const gstPercent = 18/100;
      
      let totalVerifications = 0;
      // const verificationCharge = 50;

      // Process each user's cart

      console.log("Verification Charge ==>",verificationCharge);
      const userData = userCarts.map(cart => {
          let payFor = [];


          if (cart.aadhar_number) {
              totalVerifications++;
              payFor.push("Aadhar With OTP");
          }
         

          return {
              ...cart._doc,  // Spread existing user cart data
              selected_verifications: payFor.join(",") // Add pay_for to each user entry
          };
      });

      const subtotal = totalVerifications * verificationCharge;

      const gstAmount = subtotal * gstPercent;
      const total = subtotal + gstAmount;

      
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;

      res.status(200).json({ 
          success: true, 
          data: userData, // Updated user list with pay_for field
          billing: {

            total_verifications: totalVerifications,
            wallet_amount: "0.00",
            fund_status: "NA",
            subtotal: subtotal.toFixed(2),
            discount: "0.00",
            discount_percent: "0.00",
            cgst: cgst.toFixed(2),
            cgst_percent: (gstPercent * 50).toFixed(2),
            sgst: sgst.toFixed(2),
            sgst_percent: (gstPercent * 50).toFixed(2),
            total: total.toFixed(2)
          }
      });
  } catch (error) {
      res.status(401).json({ success: false, message: "Error fetching user verification carts", error: error.message });
  }
};



export const deleteUserAadharOTP = async (req, res) => {
  try {
      const { id } = req.body;

      // Validate ID
      if (!id) {
          return res.status(400).json({ message: "ID is required" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid ID format" });
      }

      // Delete user from database
      const deletedUser = await UserCartVerificationAadhatOTP.findByIdAndDelete(id);

      if (!deletedUser) {
          return res.status(404).json({ message: "User not found" });
      }


                 return res.status(200).json({
                     success: true,
                     data: [],
                     overall_billing: {
                         total_verifications: 0,
                         wallet_amount: "0.00",
                         fund_status: "0",
                         subtotal: "0.00",
                         discount: "0.00",
                         discount_percent: "0.00",
                         cgst: "0.00",
                         cgst_percent: "0.00",
                         sgst: "0.00",
                         sgst_percent: "0.00",
                         total: "0.00"
                     },
                     message: "No unpaid verification cart items found."
                 });

     
            

  } catch (error) {
      return res.status(500).json({
          message: "Error deleting user",
          error: error.message,
      });
  }
};




export const getUserVerificationCartByEmployerAll = async (req, res) => {
    try {
        const employer_id = req.userId;
         const employer = await User.findOne({ _id: employer_id, role: 1, is_del: false });
          if (!employer) {
            return res.status(404).json({ success: false, message: "Employer not found" });
        }
        const userCarts = await UserCartVerification.find({ employer_id, is_del: false });

         const verificationCharge = parseFloat(employer.transaction_fee || 0);
        const gstPercent = parseFloat(employer.transaction_gst || 0)/100;
        
        let totalVerifications = 0;
        // const verificationCharge = 50;

        // Process each user's cart
        const userData = userCarts.map(cart => {
            let payFor = [];

            if (cart.pan_number) {
                totalVerifications++;
                payFor.push("PAN");
            }
            if (cart.aadhar_number) {
                totalVerifications++;
                payFor.push("Aadhar");
            }
            if (cart.dl_number) {
                totalVerifications++;
                payFor.push("Driving Licence");
            }
            if (cart.passport_file_number) {
                totalVerifications++;
                payFor.push("Passport");
            }
            if (cart.epic_number) {
                totalVerifications++;
                payFor.push("EPIC");
            }
            if (cart.uan_number) {
              totalVerifications++;
              payFor.push("UAN");
          }


            return {
                ...cart._doc,  // Spread existing user cart data
                selected_verifications: payFor.join(",") // Add pay_for to each user entry
            };
        });

        const subtotal = totalVerifications * verificationCharge;
        const gst = subtotal * gstPercent;
        const total = subtotal + gst;

        res.status(200).json({ 
            success: true, 
            data: userData, // Updated user list with pay_for field
            billing: {
                subtotal: subtotal.toFixed(2),
                gst: gst.toFixed(2),
                total: total.toFixed(2)
            }
        });
    } catch (error) {
        res.status(401).json({ success: false, message: "Error fetching user verification carts", error: error.message });
    }
};




export const getUserVerificationCartByEmployerAll_OLD = async (req, res) => {
    try {
        const employer_id = req.userId;
        const userCarts = await UserCartVerification.find({ employer_id, is_del: false });

        let totalVerifications = 0;

        userCarts.forEach(cart => {
            if (cart.pan_number) totalVerifications++;
            if (cart.aadhar_number) totalVerifications++;
            if (cart.dl_number) totalVerifications++;
            if (cart.passport_file_number) totalVerifications++;
            if (cart.epic_number) totalVerifications++;
        });

        const verificationCharge = 50;
        const subtotal = totalVerifications * verificationCharge;
        const gst = subtotal * 0.18;
        const total = subtotal + gst;

        res.status(200).json({ 
            success: true, 
            data: userCarts,
            billing: {
            //    total_verifications: totalVerifications,
                subtotal: subtotal.toFixed(2),
                gst: gst.toFixed(2),
                total: total.toFixed(2) 
            }
        });
    } catch (error) {
        res.status(401).json({ success: false, message: "Error fetching user verification carts", error: error.message });
    }
};

export const getUserVerificationCartByEmployer = async (req, res) => {
    try {
        const employer_id = req.userId;

        // Ensure employer is valid
        const employer = await User.findOne({ _id: employer_id, role: 1, is_del: false });

        if (!employer) {
            return res.status(404).json({ success: false, message: "Employer not found" });
        }



        const userCarts = await UserCartVerification.find({ employer_id, is_del: false, is_paid: 0 });

        if (!userCarts || userCarts.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                overall_billing: {
                    total_verifications: 0,
                    wallet_amount: "0.00",
                    fund_status: "0",
                    subtotal: "0.00",
                    discount: "0.00",
                    discount_percent: "0.00",
                    cgst: "0.00",
                    cgst_percent: "0.00",
                    sgst: "0.00",
                    sgst_percent: "0.00",
                    total: "0.00"
                },
                message: "No unpaid verification cart items found." 
            });
        }

        let overallTotalVerifications = 0;
        let overallSubtotal = 0;
        let gstPercent = 18 / 100;


      
        const discountPercentData = await CompanyPackage.findOne({ companyId: employer_id});
         
        if (!discountPercentData) {
            return res.status(404).json({ success: false, message: "Discount Percent not found" });
        }  
        console.log('Discount ==>>',discountPercentData.discount_percent);
        const discountPercent=parseFloat(discountPercentData.discount_percent || 0) / 100;

        

        const formattedData = await Promise.all(userCarts.map(async (cart) => {
            console.log('Plan ID ==>>', cart.plan);
        
            const packagedetails = await Package.findById(cart.plan);
        
            if (!packagedetails) {
                throw new Error("Package not found"); // or handle differently
            }
        
            console.log('Plan Price ==>>', packagedetails.transaction_fee);
        
            const verificationCharge = parseFloat(packagedetails.transaction_fee || 0);
            console.log(verificationCharge);
        
            const payForArray = [];
            if (cart.pan_number) payForArray.push("PAN");
            if (cart.aadhar_number) payForArray.push("Aadhaar");
            if (cart.dl_number) payForArray.push("Driving Licence");
            if (cart.passport_file_number) payForArray.push("Passport");
            if (cart.epic_number) payForArray.push("Voter ID (EPIC)");
            if (cart.uan_number) payForArray.push("UAN");
        
            const totalVerifications = payForArray.length;
        
            const subtotal = verificationCharge;
        
            overallTotalVerifications += totalVerifications;
            overallSubtotal += subtotal;
        
            return {
                id: cart._id,
                name: cart.candidate_name,
                mobile: cart.candidate_mobile || "",
                payFor: payForArray.join(", "),
                amount: subtotal
            };
        }));

        const discountAmount = overallSubtotal * discountPercent;
        const discountedSubtotal = overallSubtotal - discountAmount;

        const gstAmount = discountedSubtotal * gstPercent;
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;

        const total = discountedSubtotal + gstAmount;

      //  const fundStatus = wallet_amount >= total ? "1" : "0";

        res.status(200).json({
            success: true,
            data: formattedData,
            overall_billing: {
                total_verifications: overallTotalVerifications,
                wallet_amount: "0.00",
                fund_status: "NA",
                subtotal: overallSubtotal.toFixed(2),
                discount: discountAmount.toFixed(2),
                discount_percent: (discountPercent * 100).toFixed(2),
                cgst: cgst.toFixed(2),
                cgst_percent: (gstPercent * 50).toFixed(2),
                sgst: sgst.toFixed(2),
                sgst_percent: (gstPercent * 50).toFixed(2),
                total: total.toFixed(2)
            }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Error fetching user verification carts",
            error: error.message
        });
    }
};


export const getUserVerificationCartByEmployer_LASTUPDATE = async (req, res) => {
    try {
        const employer_id = req.userId;

         const employer = await User.findOne({ _id: employer_id, role: 1, is_del: false });

        if (!employer) {
            return res.status(404).json({ success: false, message: "Employer not found" });
        }
         const verificationCharge = parseFloat(employer.transaction_fee || 0);
        const gstPercent = parseFloat(employer.transaction_gst || 0)/100;

        const userCarts = await UserCartVerification.find({ employer_id, is_del: false,is_paid:0 });
if (!userCarts || userCarts.length === 0) {
    return res.status(200).json({
        success: true,
        data: [],
        overall_billing: {
            total_verifications: 0,
            subtotal: "0.00",
            gst: "0.00",
            total: "0.00"
        },
        message: "No unpaid verification cart items found."
    });
}
        
        let overallTotalVerifications = 0;
        let overallSubtotal = 0;

        // Prepare formatted response
        const formattedData = userCarts.map((cart, index) => {
            const payForArray = [];

            if (cart.pan_number) payForArray.push("PAN");
            if (cart.aadhar_number) payForArray.push("Aadhaar");
            if (cart.dl_number) payForArray.push("Driving Licence");
            if (cart.passport_file_number) payForArray.push("Passport");
            if (cart.epic_number) payForArray.push("Voter ID (EPIC)");

            const totalVerifications = payForArray.length;
            const subtotal = totalVerifications * verificationCharge;

            overallTotalVerifications += totalVerifications;
            overallSubtotal += subtotal;

            return {
                id: cart._id,
                name: cart.candidate_name,
                mobile: cart.candidate_mobile || "",
                payFor: payForArray.join(", "),
                amount: subtotal
            };
        });

        const overallGst = overallSubtotal * gstPercent;
        const overallTotal = overallSubtotal + overallGst;

        res.status(200).json({
            success: true,
            data: formattedData,
            overall_billing: {
                total_verifications: overallTotalVerifications,
                subtotal: overallSubtotal.toFixed(2),
                gst: overallGst.toFixed(2),
                total: overallTotal.toFixed(2)
            }
        });

    } catch (error) {
        res.status(401).json({ success: false, message: "Error fetching user verification carts", error: error.message });
    }
};


export const getPaidUserVerificationCartByEmployer = async (req, res) => {
    try {
      const employer_id = req.userId;
  
      if (!mongoose.Types.ObjectId.isValid(employer_id)) {
        return res.status(400).json({ message: "Invalid employer ID", data: [] });
      }
  
      const paidUsers = await UserVerification.find({ employer_id }).sort({ createdAt: -1 });
  
      if (!paidUsers.length) {
        return res.status(200).json({
          message: "No paid users found for this employer",
          data: [],
        });
      }
  
      // Add status field based on all_verified
      const processedUsers = paidUsers.map(user => ({
        ...user.toObject(), // convert Mongoose document to plain object
        status: user.all_verified === 1 ? 'verified' : 'processing',
      }));
  
      return res.status(200).json({
        message: "Paid users fetched successfully",
        data: processedUsers,
      });
    } catch (error) {
      console.error("Error fetching paid users:", error);
      return res.status(500).json({
        message: "Server error",
        error: error.message,
        data: [],
      });
    }
  };

  export const getAllVerifiedCandidateAdmin_24042025 = async (req, res) => {
    try {
  
      const paidUsers = await UserVerification.find({ role: 1, is_del: false, all_verified: 1 }).sort({ createdAt: -1 });
  
      if (!paidUsers.length) {
        return res.status(200).json({
          message: "No paid users found for this employer",
          data: [],
        });
      }
  
      // Add status field based on all_verified
      const processedUsers = paidUsers.map(user => ({
        ...user.toObject(), // convert Mongoose document to plain object
        status: user.all_verified === 1 ? 'verified' : 'processing',
      }));
  
      return res.status(200).json({
        message: "Paid users fetched successfully",
        data: processedUsers,
      });
    } catch (error) {
      console.error("Error fetching paid users:", error);
      return res.status(500).json({
        message: "Server error",
        error: error.message,
        data: [],
      });
    }
  };


  export const getAllVerifiedCandidateAdmin = async (req, res) => {
    try {
      const paidUsers = await UserVerification.find({
        is_del: false,
        all_verified: 1,
      })
        .populate("employer_id", "name") // only get employer name
        .sort({ createdAt: -1 });
  
      if (!paidUsers.length) {
        return res.status(200).json({
          message: "No verified candidates found",
          data: [],
        });
      }
  
      const processedUsers = paidUsers.map((user) => {
        const userObj = user.toObject();
        const verificationsDone = [];
  
        // Check which verification responses exist and add to the array
        if (userObj.pan_response) verificationsDone.push("PAN");
        if (userObj.aadhaar_response) verificationsDone.push("Aadhaar");
        if (userObj.dl_response) verificationsDone.push("DL");
        if (userObj.passport_response) verificationsDone.push("Passport");
        if (userObj.epic_response) verificationsDone.push("Voter ID");
        if (userObj.uan_response) verificationsDone.push("UAN");
        if (userObj.epfo_response) verificationsDone.push("EPFO");
  
        return {
          employer_name: userObj.employer_id?.name || "N/A",
          date: new Date(userObj.createdAt).toLocaleDateString(),
          verifications_done: verificationsDone.join(", "),
          status: "verified", // since we're only fetching all_verified = 1
          candidate_name: userObj.candidate_name,
          candidate_email: userObj.candidate_email,
          candidate_mobile: userObj.candidate_mobile,
          candidate_dob: userObj.candidate_dob,
          candidate_address: userObj.candidate_address,
          candidate_gender: userObj.candidate_gender,
          id: userObj._id,
        };
      });
  
      return res.status(200).json({
        message: "Verified candidates fetched successfully",
        data: processedUsers,
      });
    } catch (error) {
      console.error("Error fetching verified candidates:", error);
      return res.status(500).json({
        message: "Server error",
        error: error.message,
        data: [],
      });
    }
  };

  export const getAllVerifiedCandidateByCompanyForAdmin = async (req, res) => {
    try {

      const { company_id } = req.body;

      const paidUsers = await UserVerification.find({ role: 1, is_del: false, all_verified: 1, employer_id: company_id})
        .populate("employer_id", "name") // only get employer name
        .sort({ createdAt: -1 });
  
      if (!paidUsers.length) {
        return res.status(200).json({
          message: "No verified candidates found",
          data: [],
        });
      }
  
      const processedUsers = paidUsers.map((user) => {
        const userObj = user.toObject();
        const verificationsDone = [];
  
        // Check which verification responses exist and add to the array
        if (userObj.pan_response) verificationsDone.push("PAN");
        if (userObj.aadhaar_response) verificationsDone.push("Aadhaar");
        if (userObj.dl_response) verificationsDone.push("DL");
        if (userObj.passport_response) verificationsDone.push("Passport");
        if (userObj.epic_response) verificationsDone.push("Voter ID");
        if (userObj.uan_response) verificationsDone.push("UAN");
        if (userObj.epfo_response) verificationsDone.push("EPFO");
  
        return {
          employer_name: userObj.employer_id?.name || "N/A",
          date: new Date(userObj.createdAt).toLocaleDateString(),
          verifications_done: verificationsDone.join(", "),
          status: "verified", // since we're only fetching all_verified = 1
          candidate_name: userObj.candidate_name,
          candidate_email: userObj.candidate_email,
          candidate_mobile: userObj.candidate_mobile,
          candidate_dob: userObj.candidate_dob,
          candidate_address: userObj.candidate_address,
          candidate_gender: userObj.candidate_gender,
          id: userObj._id,
        };
      });
  
      return res.status(200).json({
        message: "Verified candidates fetched successfully",
        data: processedUsers,
      });
    } catch (error) {
      console.error("Error fetching verified candidates:", error);
      return res.status(500).json({
        message: "Server error",
        error: error.message,
        data: [],
      });
    }
  };

  export const getAllVerifiedCandidateByCompanyForAdmin24042025 = async (req, res) => {
    try {
  
    const { company_id } = req.body;

      const paidUsers = await UserVerification.find({ role: 1, is_del: false, all_verified: 1, employer_id: company_id }).sort({ createdAt: -1 });
  
      if (!paidUsers.length) {
        return res.status(200).json({
          message: "No paid users found for this employer",
          data: [],
        });
      }
  
      // Add status field based on all_verified
      const processedUsers = paidUsers.map(user => ({
        ...user.toObject(), // convert Mongoose document to plain object
        status: user.all_verified === 1 ? 'verified' : 'processing',
      }));
  
      return res.status(200).json({
        message: "Paid users fetched successfully",
        data: processedUsers,
      });
    } catch (error) {
      console.error("Error fetching paid users:", error);
      return res.status(500).json({
        message: "Server error",
        error: error.message,
        data: [],
      });
    }
  };

  

export const getPaidUserVerificationCartByEmployer_OLDONE = async (req, res) => {
  try {
    const employer_id = req.userId;

    if (!mongoose.Types.ObjectId.isValid(employer_id)) {
      return res.status(400).json({ message: "Invalid employer ID", data: [] });
    }

    //const paidUsers = await UserVerification.find({ employer_id,all_verified: 0, }).sort({ createdAt: -1 });

    const paidUsers = await UserVerification.find({ employer_id }).sort({ createdAt: -1 });

    if (!paidUsers.length) {
      return res.status(200).json({
        message: "No paid users found for this employer",
        data: [],
      });
    }

    return res.status(200).json({
      message: "Paid users fetched successfully",
      data: paidUsers,
    });
  } catch (error) {
    console.error("Error fetching paid users:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
      data: [],
    });
  }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.body;

        // Validate ID
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        // Delete user from database
        const deletedUser = await UserCartVerification.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

       const employer_id = req.userId;

               // Ensure employer is valid
               const employer = await User.findOne({ _id: employer_id, role: 1, is_del: false });

               if (!employer) {
                   return res.status(404).json({ success: false, message: "Employer not found" });
               }
       
       
       
               const userCarts = await UserCartVerification.find({ employer_id, is_del: false, is_paid: 0 });
       
               if (!userCarts || userCarts.length === 0) {
                   return res.status(200).json({
                       success: true,
                       data: [],
                       overall_billing: {
                           total_verifications: 0,
                           wallet_amount: "0.00",
                           fund_status: "0",
                           subtotal: "0.00",
                           discount: "0.00",
                           discount_percent: "0.00",
                           cgst: "0.00",
                           cgst_percent: "0.00",
                           sgst: "0.00",
                           sgst_percent: "0.00",
                           total: "0.00"
                       },
                       message: "No unpaid verification cart items found."
                   });
               }
       
               let overallTotalVerifications = 0;
               let overallSubtotal = 0;
               let gstPercent = 18 / 100;
       
       
             
               const discountPercentData = await CompanyPackage.findOne({ companyId: employer_id});
                
               if (!discountPercentData) {
                   return res.status(404).json({ success: false, message: "Discount Percent not found" });
               }  
               console.log('Discount ==>>',discountPercentData.discount_percent);
               const discountPercent=parseFloat(discountPercentData.discount_percent || 0) / 100;
       
               
       
               const formattedData = await Promise.all(userCarts.map(async (cart) => {
                   console.log('Plan ID ==>>', cart.plan);
               
                   const packagedetails = await Package.findById(cart.plan);
               
                   if (!packagedetails) {
                       throw new Error("Package not found"); // or handle differently
                   }
               
                   console.log('Plan Price ==>>', packagedetails.transaction_fee);
               
                   const verificationCharge = parseFloat(packagedetails.transaction_fee || 0);
                   console.log(verificationCharge);
               
                   const payForArray = [];
                   if (cart.pan_number) payForArray.push("PAN");
                   if (cart.aadhar_number) payForArray.push("Aadhaar");
                   if (cart.dl_number) payForArray.push("Driving Licence");
                   if (cart.passport_file_number) payForArray.push("Passport");
                   if (cart.epic_number) payForArray.push("Voter ID (EPIC)");
               
                   const totalVerifications = payForArray.length;
               
                   const subtotal = verificationCharge;
               
                   overallTotalVerifications += totalVerifications;
                   overallSubtotal += subtotal;
               
                   return {
                       id: cart._id,
                       name: cart.candidate_name,
                       mobile: cart.candidate_mobile || "",
                       payFor: payForArray.join(", "),
                       amount: subtotal
                   };
               }));
       
               const discountAmount = overallSubtotal * discountPercent;
               const discountedSubtotal = overallSubtotal - discountAmount;
       
               const gstAmount = discountedSubtotal * gstPercent;
               const cgst = gstAmount / 2;
               const sgst = gstAmount / 2;
       
               const total = discountedSubtotal + gstAmount;
       
             //  const fundStatus = wallet_amount >= total ? "1" : "0";
       
               res.status(200).json({
                   success: true,
                   data: formattedData,
                   overall_billing: {
                       total_verifications: overallTotalVerifications,
                       wallet_amount: "0.00",
                       fund_status: "NA",
                       subtotal: overallSubtotal.toFixed(2),
                       discount: discountAmount.toFixed(2),
                       discount_percent: (discountPercent * 100).toFixed(2),
                       cgst: cgst.toFixed(2),
                       cgst_percent: (gstPercent * 50).toFixed(2),
                       sgst: sgst.toFixed(2),
                       sgst_percent: (gstPercent * 50).toFixed(2),
                       total: total.toFixed(2)
                   }
               });

    } catch (error) {
        return res.status(500).json({
            message: "Error deleting user",
            error: error.message,
        });
    }
};

export const getUserVerificationCartByEmployerFromAdmin = async (req, res) => {
  try {
     // const employer_id = req.userId;

      const { employer_id } = req.body;

      // Ensure employer is valid
      const employer = await User.findOne({ _id: employer_id, role: 1, is_del: false });

      if (!employer) {
          return res.status(200).json({ success: false, message: "Employer not found" });
      }



      const userCarts = await UserCartVerification.find({ employer_id, is_del: false, is_paid: 0 });

      if (!userCarts || userCarts.length === 0) {
          return res.status(200).json({
              success: true,
              company_name: employer.name,
              data: [],
              overall_billing: {
                  total_verifications: 0,
                  wallet_amount: "0.00",
                  fund_status: "0",
                  subtotal: "0.00",
                  discount: "0.00",
                  discount_percent: "0.00",
                  cgst: "0.00",
                  cgst_percent: "0.00",
                  sgst: "0.00",
                  sgst_percent: "0.00",
                  total: "0.00"
              },
              message: "No unpaid verification cart items found." 
          });
      }

      let overallTotalVerifications = 0;
      let overallSubtotal = 0;
      let gstPercent = 18 / 100;


    
      const discountPercentData = await CompanyPackage.findOne({ companyId: employer_id});
       
      if (!discountPercentData) {
          return res.status(404).json({ success: false, message: "Discount Percent not found" });
      }  
      console.log('Discount ==>>',discountPercentData.discount_percent);
      const discountPercent=parseFloat(discountPercentData.discount_percent || 0) / 100;

      

      const formattedData = await Promise.all(userCarts.map(async (cart) => {
          console.log('Plan ID ==>>', cart.plan);
      
          const packagedetails = await Package.findById(cart.plan);
      
          if (!packagedetails) {
              throw new Error("Package not found"); // or handle differently
          }
      
          console.log('Plan Price ==>>', packagedetails.transaction_fee);
      
          const verificationCharge = parseFloat(packagedetails.transaction_fee || 0);
          console.log(verificationCharge);
      
          const payForArray = [];
          if (cart.pan_number) payForArray.push("PAN");
          if (cart.aadhar_number) payForArray.push("Aadhaar");
          if (cart.dl_number) payForArray.push("Driving Licence");
          if (cart.passport_file_number) payForArray.push("Passport");
          if (cart.epic_number) payForArray.push("Voter ID (EPIC)");
          if (cart.uan_number) payForArray.push("UAN");
      
          const totalVerifications = payForArray.length;
      
          const subtotal = verificationCharge;
      
          overallTotalVerifications += totalVerifications;
          overallSubtotal += subtotal;
      
          return {
              id: cart._id,
              name: cart.candidate_name,
              mobile: cart.candidate_mobile || "",
              payFor: payForArray.join(", "),
              amount: subtotal
          };
      }));

      const discountAmount = overallSubtotal * discountPercent;
      const discountedSubtotal = overallSubtotal - discountAmount;

      const gstAmount = discountedSubtotal * gstPercent;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;

      const total = discountedSubtotal + gstAmount;

    //  const fundStatus = wallet_amount >= total ? "1" : "0";

      res.status(200).json({
          success: true,
          company_name: employer.name,
          data: formattedData,
          overall_billing: {
              total_verifications: overallTotalVerifications,
              wallet_amount: "0.00",
              fund_status: "NA",
              subtotal: overallSubtotal.toFixed(2),
              discount: discountAmount.toFixed(2),
              discount_percent: (discountPercent * 100).toFixed(2),
              cgst: cgst.toFixed(2),
              cgst_percent: (gstPercent * 50).toFixed(2),
              sgst: sgst.toFixed(2),
              sgst_percent: (gstPercent * 50).toFixed(2),
              total: total.toFixed(2)
          }
      });

  } catch (error) {
      res.status(401).json({
          success: false,
          message: "Error fetching user verification carts",
          error: error.message
      });
  }
};

export const listAllTransactionByCompany_07052025 = async (req, res) => {
  try {
    const company_id = req.userId;

    console.log(company_id);

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required",
        data: [],
      });
    }

    const allTransactions = await allOrdersData.find({
      is_del: false,
      employer_id: company_id,
    })
      .populate("employer_id", "name") // only fetch employer name
      .sort({ createdAt: -1 });

    if (!allTransactions.length) {
      return res.status(200).json({
        success: false,
        message: "No transactions found for this company",
        data: [],
      });
    }

    const formattedTransactions = allTransactions.map((order) => {
      const orderObj = order.toObject();

      const hasValidCgst = orderObj.cgst && orderObj.cgst_percent;
      const hasValidSgst = orderObj.sgst && orderObj.sgst_percent;
      const hasValidDiscount = orderObj.discount_amount && orderObj.discount_percent;
    
      return {
        employer_name: orderObj.employer_id?.name || "N/A",
        order_number: orderObj.order_number,
        invoice_number: orderObj.invoice_number,
        date: new Date(orderObj.createdAt).toLocaleDateString(),
        subtotal: orderObj.subtotal ?? "N/A",
        cgst: hasValidCgst ? `${orderObj.cgst} (${orderObj.cgst_percent}%)` : "NA",
        sgst: hasValidSgst ? `${orderObj.sgst} (${orderObj.sgst_percent}%)` : "NA",
        discount: hasValidDiscount ? `${orderObj.discount_amount} (${orderObj.discount_percent}%)` : "NA",
        total_amount: orderObj.total_amount ?? "N/A",
        total_users: orderObj.total_numbers_users ?? "N/A",
        id: orderObj._id,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Company transactions fetched successfully",
      data: formattedTransactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      data: [],
    });
  }
};

export const listAllTransactionByCompany = async (req, res) => {
  try {
    const company_id = req.userId;
    const { start_date, end_date } = req.body;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required",
        data: [],
      });
    }

    // Build the date filter
    const dateFilter = {};
    if (start_date) {
      dateFilter.$gte = new Date(new Date(start_date).setHours(0, 0, 0, 0)); // Start of the day
    }
    if (end_date) {
      dateFilter.$lte = new Date(new Date(end_date).setHours(23, 59, 59, 999)); // End of the day
    }

    // Build the main filter object
    const filter = {
      is_del: false,
      employer_id: company_id,
    };

    // Add date filter if provided
    if (start_date || end_date) {
      filter.createdAt = dateFilter;
    }

    const allTransactions = await allOrdersData.find(filter)
      .populate("employer_id", "name") // only fetch employer name
      .sort({ createdAt: -1 });

    if (!allTransactions.length) {
      return res.status(200).json({
        success: true,
        message: "No transactions found for this company",
        data: [],
      });
    }

    const formattedTransactions = allTransactions.map((order) => {
      const orderObj = order.toObject();

      const hasValidCgst = orderObj.cgst && orderObj.cgst_percent;
      const hasValidSgst = orderObj.sgst && orderObj.sgst_percent;
      const hasValidDiscount = orderObj.discount_amount && orderObj.discount_percent;
    
      return {
        employer_name: orderObj.employer_id?.name || "N/A",
        order_number: orderObj.order_number,
        invoice_number: orderObj.invoice_number,
        date: new Date(orderObj.createdAt).toLocaleDateString(),
        subtotal: orderObj.subtotal ?? "N/A",
        cgst: hasValidCgst ? `${orderObj.cgst} (${orderObj.cgst_percent}%)` : "NA",
        sgst: hasValidSgst ? `${orderObj.sgst} (${orderObj.sgst_percent}%)` : "NA",
        discount: hasValidDiscount ? `${orderObj.discount_amount} (${orderObj.discount_percent}%)` : "NA",
        total_amount: orderObj.total_amount ?? "N/A",
        total_users: orderObj.total_numbers_users ?? "N/A",
        id: orderObj._id,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Company transactions fetched successfully",
      data: formattedTransactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      data: [],
    });
  }
};


export const listAllTransactionByCompanyAdmin = async (req, res) => {
  try {
    const { start_date, end_date, company_id } = req.body;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id is required",
        data: [],
      });
    }

    // Build the date filter
    const dateFilter = {};
    if (start_date) {
      dateFilter.$gte = new Date(new Date(start_date).setHours(0, 0, 0, 0)); // Start of the day
    }
    if (end_date) {
      dateFilter.$lte = new Date(new Date(end_date).setHours(23, 59, 59, 999)); // End of the day
    }

    // Build the main filter object
    const filter = {
      is_del: false,
      employer_id: company_id,
    };

    // Add date filter if provided
    if (start_date || end_date) {
      filter.createdAt = dateFilter;
    }

    const allTransactions = await allOrdersData.find(filter)
      .populate("employer_id", "name") // only fetch employer name
      .sort({ createdAt: -1 });

    if (!allTransactions.length) {
      return res.status(200).json({
        success: true,
        message: "No transactions found for this company",
        data: [],
      });
    }

    const formattedTransactions = allTransactions.map((order) => {
      const orderObj = order.toObject();

      const hasValidCgst = orderObj.cgst && orderObj.cgst_percent;
      const hasValidSgst = orderObj.sgst && orderObj.sgst_percent;
      const hasValidDiscount = orderObj.discount_amount && orderObj.discount_percent;
    
      return {
        employer_name: orderObj.employer_id?.name || "N/A",
        order_number: orderObj.order_number,
        invoice_number: orderObj.invoice_number,
        date: new Date(orderObj.createdAt).toLocaleDateString(),
        subtotal: orderObj.subtotal ?? "N/A",
        cgst: hasValidCgst ? `${orderObj.cgst} (${orderObj.cgst_percent}%)` : "NA",
        sgst: hasValidSgst ? `${orderObj.sgst} (${orderObj.sgst_percent}%)` : "NA",
        discount: hasValidDiscount ? `${orderObj.discount_amount} (${orderObj.discount_percent}%)` : "NA",
        total_amount: orderObj.total_amount ?? "N/A",
        total_users: orderObj.total_numbers_users ?? "N/A",
        id: orderObj._id,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Company transactions fetched successfully",
      data: formattedTransactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      data: [],
    });
  }
};