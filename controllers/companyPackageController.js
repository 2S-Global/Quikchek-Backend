import CompanyPackage from "../models/companyPackageModel.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Package from "../models/packageModel.js";
import nodemailer from "nodemailer";

// Create or Update Company Package
export const createCompanyPackage = async (req, res) => {
  try {
    const { companyId, selected_plan, discount_percent } = req.body;

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
    const plans = await Package.find({ _id: { $in: planIds } }).select("name description");
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
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: company.email || "sayankolkata.1995@gmail.com",
      subject: "QuikChek Account Activation and Package Details",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <p>Dear ${company.name || "Valued Partner"},</p>

          <p>Greetings from <strong>Global Employability Information Services India Limited</strong>.</p>

          <p>Following the successful creation of your <strong>QuikChek</strong> account, we are pleased to inform you that your selected service package has been activated.</p>

          <p>Based on your industry segment and requirements, the following package is now active for your account:</p>

          ${planDetailsHtml}

          <p>With this activated package, you can now begin utilizing QuikChek's fast and accurate KYC verification services.</p>

          <p>To access the platform and begin your verifications, please log in using your credentials at: <a href="https://www.quikchek.in">www.quikchek.in</a></p>

          <p>We are committed to providing you with a seamless and efficient KYC verification experience. If you have any questions about your activated package or require any assistance, please feel free to contact our support team:</p>

          <ul>
            <li><strong>Email:</strong> support@quikchek.in</li>
            <li><strong>Phone:</strong> +91-XXXXXXXXXX</li>
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
