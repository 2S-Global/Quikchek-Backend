import nodemailer from "nodemailer";
import Contact from "../models/contactModels.js";

export const addContact = async (req, res) => {
  try {
    const { name, email, subject, message, dispute } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Save to DB
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      dispute,
    });

    await contact.save();

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true, // true if port is 465, false if 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email HTML template (conditional)
    const emailTemplate = dispute
      ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: #dc2626; color: white; padding: 16px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">⚠️ New Dispute Submission</h2>
        </div>

        <!-- Body -->
        <div style="padding: 20px; background: #fff5f5;">
          <p style="font-size: 16px; margin-bottom: 16px; color: #333;">
            A user has submitted a dispute form. Please review the details below carefully:
          </p>

          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%;">👤 Name</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">📧 Email</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">📝 Subject</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">💬 Dispute Details</td>
              <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background: #fee2e2; padding: 14px; text-align: center; font-size: 13px; color: #555;">
          <p style="margin: 0;">This email was generated automatically by Quikchek’s <strong>Dispute Form</strong>.</p>
          <p style="margin: 4px 0 0;">&copy; ${new Date().getFullYear()} Quikchek</p>
        </div>
      </div>
      `
      : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: #4f46e5; color: white; padding: 16px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">📩 New Contact Submission</h2>
        </div>

        <!-- Body -->
        <div style="padding: 20px; background: #fafafa;">
          <p style="font-size: 16px; margin-bottom: 16px; color: #333;">
            You’ve received a new contact form submission. Here are the details:
          </p>

          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%;">👤 Name</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">📧 Email</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">📝 Subject</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">💬 Message</td>
              <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 14px; text-align: center; font-size: 13px; color: #555;">
          <p style="margin: 0;">This email was generated automatically by Quikchek’s <strong>Contact Form</strong>.</p>
          <p style="margin: 4px 0 0;">&copy; ${new Date().getFullYear()} Quikchek</p>
        </div>
      </div>
      `;

    // Send email
    /* email Checked */
    await transporter.sendMail({
      from: `"QuikChek Team" <${process.env.EMAIL_USER}>`,
      to: "kp.sunit@gmail.com",
      cc: ["d.dey1988@gmail.com", "avik@2sglobal.co", "abhishek@2sglobal.us"],
      subject: dispute
        ? `⚠️ New Dispute Form Submission: ${subject}`
        : `📩 New Contact Form Submission: ${subject}`,
      html: emailTemplate,
    });

    // Response
    res.status(201).json({
      success: true,
      message: dispute
        ? "Dispute submitted and email sent successfully"
        : "Contact submitted and email sent successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};
