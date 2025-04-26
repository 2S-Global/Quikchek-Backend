import CompanyPackage from "../models/companyPackageModel.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Package from "../models/packageModel.js";
import nodemailer from "nodemailer";

// Create or Update Company Package
export const createCompanyPackage = async (req, res) => {
  try {
    const {
      companyId,
      selected_plan,
      discount_percent,
      aadhar_otp,
      aadhar_price,
    } = req.body;

    if (!companyId || !selected_plan) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const finalDiscount = discount_percent ? Number(discount_percent) : 0;

    const planIds =
      typeof selected_plan === "string"
        ? selected_plan.split(",").map((id) => id.trim())
        : Array.isArray(selected_plan)
        ? selected_plan
        : [];

    const updatedOrCreated = await CompanyPackage.findOneAndUpdate(
      { companyId },
      {
        companyId,
        selected_plan: planIds,
        discount_percent: finalDiscount,
        aadhar_otp: aadhar_otp,
        aadhar_price: aadhar_price,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const company = await User.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Fetch plan names and details
    const plans = await Package.find({ _id: { $in: planIds } }).select(
      "name description"
    );
    const planDetailsHtml = plans
      .map(
        (plan) => `
          <p>
            <strong>• Package Name:</strong> <strong>${plan.name}</strong><br/>
            <strong>• Package Details:</strong> <strong>${plan.description}</strong>
          </p>
        `
      )
      .join("");

    // Email transporter
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } catch (transportError) {
      console.error("Failed to create transporter:", transportError.message);
    }

    // Email content
    const mailOptions = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: company.email,
      subject: "QuikChek Account Activation and Package Details",
      html: `  
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/lpvojh112at5ljbragy0.jpg" alt="Banner" style="width: 100%; height: auto;" />
      </div>
      
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <p>Dear ${company.name || "Valued Partner"},</p>

          <p>Greetings from <strong>Global Employability Information Services India Limited</strong>.</p>

          <p>Following the successful creation of your <strong>QuikChek</strong> account, we are pleased to inform you that your selected service package has been activated.</p>

          <p>Based on your industry segment and requirements, the following package is now active for your account:</p>

          ${planDetailsHtml}
        ${
          finalDiscount > 0
            ? `<p><strong>• Discount Applied:</strong> ${finalDiscount}%</p>`
            : ""
        }
          <p>With this activated package, you can now begin utilizing QuikChek's fast and accurate KYC verification services.</p>

          <p>To access the platform and begin your verifications, please log in using your credentials at: <a href="https://www.quikchek.in">www.quikchek.in</a></p>

          <p>We are committed to providing you with a seamless and efficient KYC verification experience. If you have any questions about your activated package or require any assistance, please feel free to contact our support team:</p>

          <ul>
            <li><strong>Email:</strong> hello@geisil.com</li>
            <li><strong>Phone:</strong>9831823898</li>
          </ul>

          <p>Thank you for choosing <strong>Global Employability Information Services India Limited</strong>.</p>

          <p>Sincerely,<br/>The Admin Team<br/><strong>Global Employability Information Services India Limited</strong></p>
        </div>
      `,
    };

    // Send email
    if (transporter) {
      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
      } catch (emailError) {
        console.error("Failed to send email:", emailError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Package created or updated successfully",
      data: updatedOrCreated,
    });
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resendCompanyPackageEmail = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res
        .status(400)
        .json({ success: false, message: "Company ID is required" });
    }

    // Get company and package
    const company = await User.findById(companyId);
    const companyPackage = await CompanyPackage.findOne({ companyId });

    if (!company || !companyPackage) {
      return res
        .status(200)
        .json({ success: true, message: "Company Package not found" });
    }

    const { selected_plan, discount_percent } = companyPackage;

    // Convert comma-separated string to array (if necessary)
    let planIds = [];
    if (typeof selected_plan === "string") {
      planIds = selected_plan.split(",").map((id) => id.trim());
    } else if (Array.isArray(selected_plan)) {
      planIds = selected_plan;
    }

    // Get plan details
    const plans = await Package.find({ _id: { $in: planIds } }).select(
      "name description"
    );
    const planDetailsHtml = plans
      .map(
        (plan) => `
          <p>
            <strong>• Package Name:</strong> <strong>${plan.name}</strong><br/>
            <strong>• Package Details:</strong> <strong>${plan.description}</strong>
          </p>
        `
      )
      .join("");

    // Email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: company.email,
      subject: "QuikChek Account Activation and Package Details - Resend",
      html: `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/lpvojh112at5ljbragy0.jpg" alt="Banner" style="width: 100%; height: auto;" />
        </div>

        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <p>Dear ${company.name || "Valued Partner"},</p>

          <p>Greetings from <strong>Global Employability Information Services India Limited</strong>.</p>

          <p>This is a follow-up email to confirm your <strong>QuikChek</strong> service package.</p>

          <p>Your active service package details:</p>
          ${planDetailsHtml}
          ${
            discount_percent > 0
              ? `<p><strong>• Discount Applied:</strong> ${discount_percent}%</p>`
              : ""
          }

          <p>Start using your services at: <a href="https://www.quikchek.in">www.quikchek.in</a></p>

          <p>Need help? Contact our support:</p>
          <ul>
            <li><strong>Email:</strong> hello@geisil.com</li>
            <li><strong>Phone:</strong> 9831823898</li>
          </ul>

          <p>Sincerely,<br/>The Admin Team<br/><strong>Global Employability Information Services India Limited</strong></p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Resend email sent successfully to", company.email);

    res.status(200).json({
      success: true,
      message: "Email resent successfully",
    });
  } catch (error) {
    console.error("Resend Email Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompanyPackagesByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required in body",
      });
    }

    const data = await CompanyPackage.findOne({ companyId }).populate(
      "companyId",
      "name email"
    ); // populate user details

    if (!data) {
      return res.status(200).json({
        success: false,
        message: "No packages found for this company",
      });
    }

    res.status(200).json({ success: true, data }); // ✅ data is a single object now
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPackageByCompany = async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.userId);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing",
      });
    }

    const data = await CompanyPackage.findOne({ companyId: companyId })
      .populate("companyId", "name email") // populate user info
      .populate("selected_plan"); // populate plan info (optional)

    if (!data) {
      return res.status(200).json({
        success: false,
        message: "No packages found for this company",
      });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Utility to parse plan_id string/array
const parsePlanIds = (selected_plan) => {
  if (typeof selected_plan === "string") {
    return selected_plan.split(",").map((id) => id.trim());
  }
  return Array.isArray(selected_plan) ? selected_plan : [];
};


export const sidebarAadharOtp=async (req,res) =>{
 try {
    const companyId = new mongoose.Types.ObjectId(req.userId);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing",
      });
    }

    const data = await CompanyPackage.findOne({ companyId: companyId })
     
 if (!data) {
      return res.status(200).json({
        success: false,
        aadhar_otp:disable,
        message: "No packages found for this company",
      });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

