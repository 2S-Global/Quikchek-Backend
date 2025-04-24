import User from "../models/userModel.js";
import UserVerification from "../models/userVerificationModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import nodemailer from "nodemailer";

export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;

    // Validate request body
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword?.trim() || !newPassword?.trim()) {
      return res.status(400).json({
        message: "Both old and new passwords are required.",
        success: false,
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user || user.is_del) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid old password.",
        success: false,
      });
    }

    // Hash new password
    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully.",
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

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      transaction_fee,
      transaction_gst,
      allowed_verifications,
      phone_number,
      address,
      gst_no,
      package_id,
      discount_percent,
    } = req.body;
    const role = 1;
    const self_registered=0;
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email,
      is_del: false,
      is_active: true,
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
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
    });
    await newUser.save();
    /* const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    }); */

    // Send email with login credentials
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com", // fixed typo
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
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745316541/QuikChek%20images/nbnkdrtxbawjjh2zgs1y.jpg" alt="Banner" style="width: 100%; height: auto;" />
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
      
        <p>
          Please log in to the platform at 
          <a href="https://www.quikchek.in" target="_blank">https://www.quikchek.in</a> 
          using the provided credentials. We strongly recommend that you change your password
          upon your first login for security reasons.
        </p>
      
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
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "User registered and logged in successfully!",
      /* token, */
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};



// Register a new user
export const RegisterFrontEnd = async (req, res) => {
  try {
    const {
      user_type,
      name,
      email,
      password,
      phone_number,
      address,
      gst_no,
      required_services
    } = req.body;
    const role = 1;
    const self_registered=1;
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email,
      is_del: false,
      is_active: true,
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with hashed password
    const newUser = new User({
      user_type,
      name,
      email,
      password: hashedPassword,
      role,
      phone_number,
      address,
      gst_no,
      required_services,
      self_registered,
    });
    await newUser.save();
    /* const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    }); */

    // Send email with login credentials
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com", // fixed typo
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
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745316541/QuikChek%20images/nbnkdrtxbawjjh2zgs1y.jpg" alt="Banner" style="width: 100%; height: auto;" />
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
      
        <p>
          Please log in to the platform at 
          <a href="https://www.quikchek.in" target="_blank">https://www.quikchek.in</a> 
          using the provided credentials. We strongly recommend that you change your password
          upon your first login for security reasons.
        </p>
      
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
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "User registered and logged in successfully!",
      /* token, */
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};




export const editUser = async (req, res) => {
  const {
    name,
    allowed_verifications,
    transaction_fee,
    transaction_gst,
    id,
    phone_number,
    address,
    gst_no,
    package_id,
    discount_percent,
  } = req.body;

  try {
    const updatedFields = {};

    if (name !== undefined) updatedFields.name = name;
    if (allowed_verifications !== undefined)
      updatedFields.allowed_verifications = allowed_verifications;
    if (transaction_fee !== undefined)
      updatedFields.transaction_fee = transaction_fee;
    if (transaction_gst !== undefined)
      updatedFields.transaction_gst = transaction_gst;

    updatedFields.phone_number = phone_number;
    updatedFields.address = address;
    updatedFields.gst_no = gst_no;
    updatedFields.package_id = package_id;
    updatedFields.discount_percent = discount_percent;

    updatedFields.updatedAt = Date.now(); // ensure updatedAt is modified

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    // Generate a new arbitrary password (e.g. 8 characters)
    const generatePassword = () => {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#";
      let password = "";
      for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const newPassword = generatePassword();

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in DB
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    // Send email with new password
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Successful - Action Required",
      html: `<div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745316860/QuikChek%20images/owceg8jalnqjjgutsgz4.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
              <h3>Dear ${user.name},</h3>
              <p>Your password has been successfully reset as per your request. Please find your new login credentials below:</p>
              <p><strong>New Password:</strong> ${newPassword}</p>
              <p>For your security, we strongly recommend that you log in immediately and change this password to something more personal and secure.</p>
              <p>
              If you did not request this password reset or have any concerns, please contact our support team right away.
              
              
              </p>
              <br/>
              <p>Stay secure,<br/>Geisil Team</p>
          `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "New password sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};

export const getUserDetailsById = async (req, res) => {
  try {
    const { company_id } = req.body; // Or use req.params if it's from URL

    if (!company_id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(company_id).select(
      "name email phone_number address"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Transform allowed_verifications to boolean object

    const result = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      address: user.address,
    };

    res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// Register a new company
export const registerCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = 1;
    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with hashed password
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      message: "User registered and logged in successfully!",
      token,
      /*  data: newUser, */
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};
// Login a user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email, is_del: false, is_active: true });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If password is hashed, compare using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      data: user,
      role: user.role,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in user", error: error.message });
  }
};

export const listCompanies = async (req, res) => {
  try {
    // Get all companies (role: 1 and is_del: false)
    const companies = await User.find({ is_del: false, role: 1, self_registered: 0 }).select("-password");

    if (!companies.length) {
      return res.status(404).json({ message: "No companies found" });
    }

    // Get order counts grouped by employer_id
    const orderCounts = await UserVerification.aggregate([
      { $match: { is_del: false } },
      { $group: { _id: "$employer_id", orderCount: { $sum: 1 } } }
    ]);

    // Convert orderCounts to a map for quick lookup
    const orderMap = {};
    orderCounts.forEach(({ _id, orderCount }) => {
      orderMap[_id.toString()] = orderCount;
    });

    // Attach order count to each company
    const companiesWithOrderCount = companies.map((company) => {
      const companyId = company._id.toString();
      return {
        ...company.toObject(),
        orderCount: orderMap[companyId] || 0,
      };
    });

    res.status(200).json({
      success: true,
      message: "Companies retrieved successfully",
      data: companiesWithOrderCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving companies",
      error: error.message,
    });
  }
};


export const listSelfRegisteredCompanies = async (req, res) => {
  try {
    // Get all companies (role: 1 and is_del: false)
    const companies = await User.find({ is_del: false, role: 1, self_registered: 1 }).select("-password");

    if (!companies.length) {
      return res.status(200).json({ message: "No companies found" });
    }

    // Get order counts grouped by employer_id
    const orderCounts = await UserVerification.aggregate([
      { $match: { is_del: false } },
      { $group: { _id: "$employer_id", orderCount: { $sum: 1 } } }
    ]);

    // Convert orderCounts to a map for quick lookup
    const orderMap = {};
    orderCounts.forEach(({ _id, orderCount }) => {
      orderMap[_id.toString()] = orderCount;
    });

    // Attach order count to each company
    const companiesWithOrderCount = companies.map((company) => {
      const companyId = company._id.toString();
      return {
        ...company.toObject(),
        orderCount: orderMap[companyId] || 0,
      };
    });

    res.status(200).json({
      success: true,
      message: "Companies retrieved successfully",
      data: companiesWithOrderCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving companies",
      error: error.message,
    });
  }
};


export const listFieldsByCompany = async (req, res) => {
  try {
    const { company_id } = req.body;

    const company = await User.findById(company_id).select(
      "transaction_fee transaction_gst allowed_verifications package_id gst_no discount_percent"
    );

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    // Convert allowed_verifications to object
    const allTypes = ["PAN", "Aadhaar", "DL", "EPIC", "Passport"];
    const allowedTypes = (company.allowed_verifications || "")
      .split(",")
      .map((v) => v.trim().toUpperCase());

    const allowedVerificationsObj = {};
    allTypes.forEach((type) => {
      allowedVerificationsObj[type] = allowedTypes.includes(type);
    });

    // Overwrite original string field with the object
    const companyData = {
      ...company._doc,
      ...allowedVerificationsObj,
    };

    // Get fields
    const fields = await Fields.find({ company_id, is_del: false }).select(
      "-company_id"
    );

    res.status(200).json({
      success: true,
      message: "Fields fetched successfully",
      company: companyData,
      data: fields,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching fields",
      error: error.message,
    });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.body;

    // Validate and convert companyId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid company ID" });
    }

    const objectId = new mongoose.Types.ObjectId(companyId);

    // Find and update the company
    const deletedCompany = await User.findOneAndUpdate(
      { _id: objectId, role: 1, is_del: false },
      { is_del: true, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
      data: deletedCompany,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting company",
      error: error.message,
    });
  }
};

export const toggleCompanyStatus = async (req, res) => {
  try {
    const { status, companyId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid company ID" });
    }

    if (typeof status !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. It must be true or false.",
      });
    }

    const objectId = new mongoose.Types.ObjectId(companyId);

    const updatedCompany = await User.findOneAndUpdate(
      { _id: objectId, role: 1, is_del: false }, // 👈 FIXED HERE
      { is_active: status, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedCompany) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    res.status(200).json({
      success: true,
      message: `Company has been ${
        status ? "activated" : "deactivated"
      } successfully`,
      data: updatedCompany,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating company status",
      error: error.message,
    });
  }
};
