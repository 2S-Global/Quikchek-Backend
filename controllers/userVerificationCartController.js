import UserCartVerification from "../models/userVerificationCartModel.js";
import UserVerification from "../models/userVerificationModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
// Register a new user

export const addUserToCart = async (req, res) => {
    try {

        const user_id = req.userId;
        //check user exists
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }


        const {
            name,
            email,
            phone,
            dob,
            address,
            gender,
            panname,
            pannumber,
            pandoc,
            aadhaarname,
            aadhaarnumber,
            aadhaardoc,
            licensename,
            licensenumber,
            licensenumdoc,
            passportname,
            passportnumber,
            passportdoc,
            votername,
            voternumber,
            voterdoc,
            additionalfields,
            uannumber
        } = req.body;

        const newUserCart = new UserCartVerification({
            employer_id : user_id,
            candidate_name : name,
            candidate_email : email,
            candidate_mobile : phone,
            candidate_dob : dob,
            candidate_address : address,
            candidate_gender : gender,
            pan_name : panname,
            pan_number : pannumber,
            pan_image : pandoc,
            aadhar_name : aadhaarname,
            aadhar_number : aadhaarnumber,
            aadhar_image : aadhaardoc,
            dl_name : licensename,
            dl_number : licensenumber,
            dl_image : licensenumdoc,
            passport_name : passportname,
            passport_file_number : passportnumber,
            passport_image : passportdoc,
            epic_name : votername,
            epic_number : voternumber,
            epic_image : voterdoc,
            additionalfields : additionalfields,
            uan_number:uannumber
        });

        await newUserCart.save();
        res.status(201).json({ success: true, message: "User verification cart added successfully", data: newUserCart });
    } catch (error) {
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

        const verificationCharge = parseFloat(employer.transaction_fee || 0);
        const gstPercent = parseFloat(employer.transaction_gst || 0) / 100;
        const discountPercent = parseFloat(employer.discount_percent || 0) / 100;
        const wallet_amount = parseFloat(employer.wallet_amount || 0);
        const packageId = employer.package_id;

        const userCarts = await UserCartVerification.find({ employer_id, is_del: false, is_paid: 0 });

        if (!userCarts || userCarts.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                overall_billing: {
                    total_verifications: 0,
                    wallet_amount: wallet_amount.toFixed(2),
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

        const formattedData = userCarts.map((cart) => {
            const payForArray = [];

            if (cart.pan_number) payForArray.push("PAN");
            if (cart.aadhar_number) payForArray.push("Aadhaar");
            if (cart.dl_number) payForArray.push("Driving Licence");
            if (cart.passport_file_number) payForArray.push("Passport");
            if (cart.epic_number) payForArray.push("Voter ID (EPIC)");

            const totalVerifications = payForArray.length;

            // Updated logic: if package_id is "1", charge once per row
            const subtotal = packageId === "1"
                ? (totalVerifications > 0 ? verificationCharge : 0)
                : totalVerifications * verificationCharge;

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

        const discountAmount = overallSubtotal * discountPercent;
        const discountedSubtotal = overallSubtotal - discountAmount;

        const gstAmount = discountedSubtotal * gstPercent;
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;

        const total = discountedSubtotal + gstAmount;

        const fundStatus = wallet_amount >= total ? "1" : "0";

        res.status(200).json({
            success: true,
            data: formattedData,
            overall_billing: {
                total_verifications: overallTotalVerifications,
                wallet_amount: wallet_amount.toFixed(2),
                fund_status: fundStatus,
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
        // Assuming the userId is available from authentication middleware (e.g., JWT)
        const employer_id = req.userId;

        // Check if employer_id is a valid ObjectId (Optional, but recommended)
        if (!mongoose.Types.ObjectId.isValid(employer_id)) {
            return res.status(400).json({ message: "Invalid employer ID" });
        }

        // Fetch users with paid verification and sort by createdAt in descending order
        const paidUsers = await UserVerification.find({ employer_id })
            .sort({ createdAt: -1 });

        if (!paidUsers.length) {
            return res.status(404).json({ message: "No paid users found for this employer" });
        }

        // Return the fetched users
        res.status(200).json(paidUsers);
    } catch (error) {
        console.error("Error fetching paid users:", error);
        res.status(500).json({ message: "Server error", error: error.message });
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

        const verificationCharge = parseFloat(employer.transaction_fee || 0);
        const gstPercent = parseFloat(employer.transaction_gst || 0) / 100;
        const discountPercent = parseFloat(employer.discount_percent || 0) / 100;
        const wallet_amount = parseFloat(employer.wallet_amount || 0);
        const packageId = employer.package_id;

        const userCarts = await UserCartVerification.find({ employer_id, is_del: false, is_paid: 0 });

        if (!userCarts || userCarts.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                overall_billing: {
                    total_verifications: 0,
                    wallet_amount: wallet_amount.toFixed(2),
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

        const formattedData = userCarts.map((cart) => {
            const payForArray = [];

            if (cart.pan_number) payForArray.push("PAN");
            if (cart.aadhar_number) payForArray.push("Aadhaar");
            if (cart.dl_number) payForArray.push("Driving Licence");
            if (cart.passport_file_number) payForArray.push("Passport");
            if (cart.epic_number) payForArray.push("Voter ID (EPIC)");

            const totalVerifications = payForArray.length;

            // Updated logic: if package_id is "1", charge once per row
            const subtotal = packageId === "1"
                ? (totalVerifications > 0 ? verificationCharge : 0)
                : totalVerifications * verificationCharge;

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

        const discountAmount = overallSubtotal * discountPercent;
        const discountedSubtotal = overallSubtotal - discountAmount;

        const gstAmount = discountedSubtotal * gstPercent;
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;

        const total = discountedSubtotal + gstAmount;

        const fundStatus = wallet_amount >= total ? "1" : "0";

        res.status(200).json({
            success: true,
            data: formattedData,
            overall_billing: {
                total_verifications: overallTotalVerifications,
                wallet_amount: wallet_amount.toFixed(2),
                fund_status: fundStatus,
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



