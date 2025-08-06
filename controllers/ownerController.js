import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

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
    let entityName = "Association";
    try {
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

        if (role === 2) {
            entityName = "Association";
        } else if (role === 1) {
            entityName = "Company";
        }
        // else if (role === 1) {
        //     entityName = "Candidate";
        // }

        // Check if user already exists
        const existingUser = await User.findOne({
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
        const newUser = new User({
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

        await transporter.sendMail(mailOptions);

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