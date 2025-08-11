import User from "../models/userModel.js";
import ownerdetails from "../models/ownerDetailsModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import fsp from "fs/promises";
import path from "path";
import csv from "csv-parser";
import fs from "fs";

export const testController = async (req, res) => {
    try {

        return res.status(200).json({
            message: "Test Controller Running Successfully.",
            success: true,
        });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({
            message: "An error occurred while changing the password.",
            success: false,
        });
    }
};



// Register a new owner user
export const registerOwnerUser = async (req, res) => {
    let entityName = "Owner";
    try {

        // Role = 5 for Association
        const loggedInUserId = req.userId;

        if (!loggedInUserId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }

        // Check if the user exists
        const loggedInUser = await User.findOne({ _id: loggedInUserId, is_del: false, is_active: true }).lean();

        if (!loggedInUser) {
            return res.status(404).json({ message: "User not found." });
        }

        const {
            name,
            email,
            transaction_fee,
            transaction_gst,
            allowed_verifications,
            phone_number,
            address,
            gst_no,
            package_id,
            discount_percent,
            role,
            check_role,
            switchedRole,
        } = req.body;

        // Generate a 6-digit random password
        const password = Math.floor(100000 + Math.random() * 900000).toString();

        //  const role = 1;
        const self_registered = 0;
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, password" });
        }

        if (role === 6) {
            entityName = "Owner";
        } else if (role === 1) {
            entityName = "Company";
        }
        // else if (role === 1) {
        //     entityName = "Candidate";
        // }

        // Check if user already exists
        const existingUser = await ownerdetails.findOne({
            email,
            is_del: false,
            is_active: true,
        }).lean();
        if (existingUser) {
            return res.status(400).json({ message: `${entityName} already exists` });
        }

        // Hash the password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user with hashed password
        const newUser = new ownerdetails({
            complex_id: loggedInUserId,
            name,
            email,
            password: hashedPassword,
            role,
            transaction_fee,
            transaction_gst,
            allowed_verifications,
            phone_number,
            address,
            gst_no,
            package_id,
            discount_percent,
            self_registered,
            check_role: check_role || false,
            switchedRole: check_role ? 2 : null,
        });
        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "3d",
        });

        // Send email with login credentials
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: 465,
            secure: true, // true for port 465
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject:
                "Access Credentials for QuikChek - Fast & Accurate KYC Verification Platform",
            html: `
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Greetings from <strong>Global Employability Information Services India Limited</strong>.</p>
        <p>
          We are pleased to provide you with access to our newly launched platform,
          <a href="https://www.quikchek.in" target="_blank">https://www.quikchek.in</a>,
          designed for fast and accurate verification of KYC documents. This platform will
          streamline your verification processes, enhance efficiency, and ensure compliance.
        </p>
      
        <p>Your corporate account has been successfully created with the following credentials:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
      
        <p>Click the link  to verify your email: <a href="${process.env.CLIENT_BASE_URL}/api/auth/verify-email/${token}">Verify Email</a></p>
       

      
        <p><strong>Key Features and Benefits of QuikChek:</strong></p>
        <ul>
          <li>Rapid Verification: Significantly reduced turnaround times for KYC document verification.</li>
          <li>Enhanced Accuracy: Advanced technology minimizes errors and ensures reliable results.</li>
          <li>Secure Platform: Built with robust security measures to protect sensitive data.</li>
          <li>Comprehensive Coverage: Supports a wide range of KYC documents.</li>
          <li>User-Friendly Interface: Intuitive design for a smooth verification experience.</li>
          <li>Audit Trail: Complete record of all verification activity.</li>
        </ul>
      
        <p>
          We are confident that QuikChek will significantly improve your KYC verification workflow.
        </p>
      
        <p>
          For any assistance with the platform, including login issues or technical support, please contact our support team at:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:info@geisil.com">info@geisil.com</a></li>
          <li><strong>Phone:</strong> 9831823898</li>
        </ul>
      
        <p>Thank you for choosing <strong>Global Employability Information Services India Limited</strong>.</p>
        <p>We look forward to supporting your KYC verification needs.</p>
      
        <br />
        <p>Sincerely,<br />
        The Admin Team<br />
        <strong>Global Employability Information Services India Limited</strong></p>

         <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
      `,
        };

        // await transporter.sendMail(mailOptions);

        res.status(201).json({
            success: true,
            message: `${entityName} registered successfully!`,
            /* token, */
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: `Error creating ${entityName}`, error: error.message });
    }
};


// List Owner Users
export const listOwners = async (req, res) => {
    try {
        // Get all companies (role: 1 and is_del: false)

        const loggedInUserId = req.userId;

        if (!loggedInUserId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }

        const { role } = req.body;

        let entityName = "Owner";
        if (role === 6) {
            entityName = "Owner";
        } else if (role === 1) {
            entityName = "Company";
        } else if (role === 5) {
            entityName = "Association";
        }

        const flatOwners = await ownerdetails.find({
            complex_id: loggedInUserId,
            is_del: false,
            role: role,
            self_registered: { $ne: 1 },
        }).select("-password");

        if (!flatOwners.length) {
            return res.status(200).json({ success: true, message: `No ${entityName} found` });
        }

        // Get order counts grouped by employer_id
        /* const orderCounts = await UserVerification.aggregate([
          { $match: { is_del: false } },
          { $group: { _id: "$employer_id", orderCount: { $sum: 1 } } },
        ]); */

        // Convert orderCounts to a map for quick lookup
        const orderMap = {};
        /*orderCounts.forEach(({ _id, orderCount }) => {
          orderMap[_id.toString()] = orderCount;
        }); */

        // Attach order count to each company
        const flatOwnersWithOrderCount = flatOwners.map((owners) => {
            const ownerId = owners._id.toString();
            return {
                ...owners.toObject(),
                orderCount: orderMap[ownerId] || 0,
            };
        });

        res.status(200).json({
            success: true,
            message: `${entityName} retrieved successfully`,
            data: flatOwnersWithOrderCount,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving companies",
            error: error.message,
        });
    }
};


// Edit Owner User
export const editOwners = async (req, res) => {
    const {
        name,
        email,
        allowed_verifications,
        transaction_fee,
        transaction_gst,
        id,
        phone_number,
        address,
        gst_no,
        package_id,
        discount_percent,
        role,
        check_role,
    } = req.body;

    try {
        const updatedFields = {};

        let entityName = "Owner";
        if (role === 6) {
            entityName = "Owner";
        } else if (role === 1) {
            entityName = "Company";
        }

        // Check if user already exists
        const existingUser = await ownerdetails.findOne({
            email,
            _id: { $ne: id },
            is_del: false,
            is_active: true,
        });
        if (existingUser) {
            return res
                .status(200)
                .json({ success: true, message: "Email already exists" });
        }

        const getDetails = await ownerdetails.findOne({
            _id: id,
            is_del: false,
        });

        // const oldemail = getDetails.email;
        // console.log(oldemail);

        if (name !== undefined) updatedFields.name = name;
        if (allowed_verifications !== undefined)
            updatedFields.allowed_verifications = allowed_verifications;
        if (transaction_fee !== undefined)
            updatedFields.transaction_fee = transaction_fee;
        if (transaction_gst !== undefined)
            updatedFields.transaction_gst = transaction_gst;

        updatedFields.phone_number = phone_number;
        updatedFields.email = email;
        updatedFields.address = address;
        updatedFields.gst_no = gst_no;
        updatedFields.package_id = package_id;
        updatedFields.discount_percent = discount_percent;

        updatedFields.updatedAt = Date.now(); // ensure updatedAt is modified

        if (check_role !== undefined) {
            updatedFields.check_role = check_role;
            updatedFields.switchedRole = check_role ? 2 : null;
        }

        const updatedUser = await ownerdetails.findByIdAndUpdate(
            id,
            { $set: updatedFields },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: `${entityName} not found` });
        }

        // if (oldemail != email) {
        //   const transporter = nodemailer.createTransport({
        //     host: "smtp.hostinger.com", // fixed typo
        //     port: 465,
        //     secure: true, // true for port 465
        //     auth: {
        //       user: process.env.EMAIL_USER,
        //       pass: process.env.EMAIL_PASS,
        //     },
        //   });

        //   const mailOptions = {
        //     from: `"E2Score Team" <${process.env.EMAIL_USER}>`,
        //     to: email,
        //     subject:
        //       "Your Email Address Has Been Updated QuikChek - Fast & Accurate KYC Verification Platform",
        //     html: `
        //     <div style="text-align: center; margin-bottom: 20px;">
        //   <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745316541/QuikChek%20images/nbnkdrtxbawjjh2zgs1y.jpg" alt="Banner" style="width: 100%; height: auto;" />
        // </div>
        //       <p>Dear <strong>${name}</strong>,</p>
        //       <p>We wanted to let you know that the email address associated with your account was recently changed.</p>

        //         <p><strong>New Email Address::</strong> ${email}</p>

        //       <p>If you made this change, no further action is needed.</p>

        //       <p>If you didn’t make this change or believe it was done in error, please contact our support team immediately so we can help secure your account.</p>
        //       <br />
        //       <p>Sincerely,<br />
        //       The Admin Team<br />
        //       <strong>E2Score India Limited</strong></p>
        //     `,
        //   };

        //   await transporter.sendMail(mailOptions);
        //}

        res.status(200).json({
            success: true,
            message: `${entityName} updated successfully`,
            user: updatedUser,
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: `Error updating ${entityName}`, error: error.message });
    }
};

// Delete Owner User
export const deleteOwners = async (req, res) => {
    try {

        // Role = 5 for Association
        const loggedInUserId = req.userId;

        if (!loggedInUserId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }

        // Check if the user exists
        const loggedInUser = await User.findOne({ _id: loggedInUserId, is_del: false, is_active: true }).lean();

        if (!loggedInUser) {
            return res.status(404).json({ message: "User not found." });
        }

        const { ownerId, role } = req.body;

        let entityName = "Owner";
        if (role === 6) {
            entityName = "Owner";
        } else if (role === 1) {
            entityName = "Company";
        }

        // Validate and convert companyId to ObjectId
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            return res
                .status(400)
                .json({ success: false, message: `Invalid ${entityName} ID` });
        }

        const objectId = new mongoose.Types.ObjectId(ownerId);

        // Find and update the company
        const deletedCompany = await ownerdetails.findOneAndUpdate(
            { _id: objectId, complex_id: loggedInUserId, role: role, is_del: false },
            { is_del: true, updatedAt: new Date() },
            { new: true }
        );

        if (!deletedCompany) {
            return res.status(404).json({
                success: false,
                message: `${entityName} not found or already deleted`,
            });
        }

        res.status(200).json({
            success: true,
            message: `${entityName} deleted successfully`,
            data: deletedCompany,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting Owner",
            error: error.message,
        });
    }
};


// Import CSV file
export const importOwnerCsv = async (req, res) => {

    const loggedInUserId = req.userId;

    if (!loggedInUserId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    if (!req.file)
        return res.status(400).json({ message: "CSV file is required" });

    const filePath = path.resolve(req.file.path);
    const users = [];

    try {
        // 1. Parse CSV
        await new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", (row) => {
                    if (row.email) {
                        results.push({
                            complex_id: loggedInUserId,
                            name: row.name,
                            email: row.email,
                            phone_number: row.phone,
                            address: row.address,
                            gst_no: row.gst,
                            role: 6,
                            is_del: false
                        });
                    }
                })
                .on("end", () => {
                    users.push(...results);
                    resolve();
                })
                .on("error", reject);
        });

        // 2. Check existing users
        const emails = users.map((u) => u.email);
        await mongoose.connection.asPromise();
        const existingUsers = await ownerdetails.find({
            complex_id: loggedInUserId,
            email: { $in: emails },
            is_del: false,
        });
        const existingEmails = new Set(existingUsers.map((u) => u.email));

        // 3. Create new users
        /*
        const newUsersPromises = users
            .filter((user) => !existingEmails.has(user.email))
            .map(async (user) => {
                const password = Math.floor(100000 + Math.random() * 900000).toString();
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject:
                        "Access Credentials for E2Score - Fast & Accurate KYC Verification Platform",
                    html: `
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/bx5dt5rz0zdmowryb0bz.jpg" alt="Banner" style="width: 100%; height: auto;" />
        </div>
          <p>Dear <strong>${user.name}</strong>,</p>
          <p>Greetings from <strong>Global Employability Information Services India Limited</strong>.</p>
          <p>
            We are pleased to provide you with access to our newly launched platform,
            <a href="https://www.e2score.in" target="_blank">https://www.e2score.in</a>,
            designed for fast and accurate verification of KYC documents. This platform will
            streamline your verification processes, enhance efficiency, and ensure compliance.
          </p>
        
          <p>Your corporate account has been successfully created with the following credentials:</p>
          <ul>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Password:</strong> ${password}</li>
          </ul>
        
          <p>
            Please log in to the platform at 
            <a href="https://www.e2score.in" target="_blank">https://www.e2score.in</a> 
            using the provided credentials. We strongly recommend that you change your password
            upon your first login for security reasons.
          </p>
        
          <p><strong>Key Features and Benefits of E2Score:</strong></p>
          <ul>
            <li>Rapid Verification: Significantly reduced turnaround times for KYC document verification.</li>
            <li>Enhanced Accuracy: Advanced technology minimizes errors and ensures reliable results.</li>
            <li>Secure Platform: Built with robust security measures to protect sensitive data.</li>
            <li>Comprehensive Coverage: Supports a wide range of KYC documents.</li>
            <li>User-Friendly Interface: Intuitive design for a smooth verification experience.</li>
            <li>Audit Trail: Complete record of all verification activity.</li>
          </ul>
        
          <p>We are confident that E2Score will significantly improve your KYC verification workflow.</p>
        
          <p>For any assistance with the platform, including login issues or technical support, please contact our support team at: </p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:info@geisil.com">info@geisil.com</a></li>
            <li><strong>Phone:</strong> 9831823898</li>
          </ul>
        
          <p>Thank you for choosing <strong>E2Score India Limited</strong>.</p>
          <p>We look forward to supporting your KYC verification needs.</p>
        
          <br />
          <p>Sincerely,<br />
          The Admin Team<br />
          <strong>E2Score India Limited</strong></p>
        `,
                };

                try {
                    await transporter.sendMail(mailOptions);
                } catch (err) {
                    console.error(`Email failed to ${user.email}:`, err.message);
                }

                return {
                    ...user,
                    password: hashedPassword,
                    role: 3,
                };
            });
        */

        //const newUsers = await Promise.all(newUsersPromises);

        // Filter only new users
        const newUsers = users.filter((user) => !existingEmails.has(user.email));

        const insertedUsers = await ownerdetails.insertMany(newUsers);

        await fsp.unlink(filePath);

        res.json({
            success: true,
            inserted: insertedUsers.length,
            skipped: existingEmails.size,
            message: "Owner CSV import completed successfully",
        });
    } catch (error) {
        console.error("Import error:", error);
        await fsp.unlink(filePath).catch(() => { });
        res.status(500).json({ message: "Import failed", error: error.message });
    }
}