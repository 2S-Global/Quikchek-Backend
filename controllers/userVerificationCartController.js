import UserCartVerification from "../models/userVerificationCartModel.js";
import UserVerification from "../models/userVerificationModel.js";
import User from "../models/userModel.js";
import Package from "../models/packageModel.js";
import CompanyPackage from "../models/companyPackageModel.js";
import mongoose from "mongoose";
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
// Register a new user



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload a file to Cloudinary
const getResourceType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype === 'application/pdf') return 'raw';
  return 'auto';
};

const uploadToCloudinary = async (fileBuffer, filename, mimetype) => {
  const resourceType = getResourceType(mimetype);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'user_verification_documents',
        resource_type: resourceType,
        // public_id: filename,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

export const addUserToCart = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const { plan, name, email, phone, dob, address, gender, panname, pannumber, pandoc, aadhaarname, aadhaarnumber, aadhaardoc, licensename, licensenumber, licensenumdoc, passportname, passportnumber, passportdoc, votername, voternumber, voterdoc, additionalfields, uannumber } = req.body;

    // Upload documents to Cloudinary
const panImageUrl = req.files?.pandoc
  ? await uploadToCloudinary(req.files.pandoc[0].buffer, 'pan_doc', req.files.pandoc[0].mimetype)
  : null;

const aadharImageUrl = req.files?.aadhaardoc
  ? await uploadToCloudinary(req.files.aadhaardoc[0].buffer, 'aadhaar_doc', req.files.aadhaardoc[0].mimetype)
  : null;

const dlImageUrl = req.files?.licensedoc
  ? await uploadToCloudinary(req.files.licensedoc[0].buffer, 'licensedoc', req.files.licensedoc[0].mimetype)
  : null;

const passportImageUrl = req.files?.doc
  ? await uploadToCloudinary(req.files.doc[0].buffer, 'doc', req.files.doc[0].mimetype)
  : null;

const epicImageUrl = req.files?.voterdoc
  ? await uploadToCloudinary(req.files.voterdoc[0].buffer, 'voter_doc', req.files.voterdoc[0].mimetype)
  : null;



    const newUserCart = new UserCartVerification({
      employer_id: user_id,
      plan: plan,
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
    });

    await newUserCart.save();
    res.status(201).json({ success: true, message: "User verification cart added successfully", data: newUserCart });
  } catch (error) {
    console.error("Error adding user to cart:", error);
    res.status(401).json({ success: false, message: "Error adding user verification cart", error: error.message });
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



