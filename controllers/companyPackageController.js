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

    // Fetch plan names
    const plans = await Package.find({ _id: { $in: planIds } }).select("name");
    const planNames = plans.map((plan) => plan.name);

    // Setup email transporter
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

    // Email HTML Content
    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: company.email,
      subject: "Company Package Created/Updated",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4CAF50;">🎉 Company Package Update</h2>
          <p>Dear ${company.name || "Company"},</p>

          <p>Your company package has been <strong>successfully created/updated</strong>. Here are the details:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Company Name</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${
                company.name
              }</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Selected Plans</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${planNames.join(
                ", "
              )}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>Discount Percent</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${finalDiscount}%</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">If you have any questions, feel free to contact our support team.</p>

          <p style="margin-top: 30px;">Thanks & Regards,<br/><strong>Support Team</strong></p>
        </div>
      `,
    };

    // Send the email
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
