import UserVerification from "../models/userVerificationModel.js";
import puppeteer from "puppeteer";
import cloudinary from "cloudinary";
import stream from "stream";

// Ensure Cloudinary is properly configured
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generatePDF = async (req, res) => {
  try {
    const verifiedUsers = await UserVerification.find({ all_verified: 1 });

    if (verifiedUsers.length === 0) {
      return res.status(404).json({ message: "No verified users found" });
    }

    let uploadedFiles = [];

    for (const user of verifiedUsers) {
      const userId = user._id.toString();
      const userName = user.candidate_name;

      // HTML content for the PDF
      const htmlContent = `
        <html>
        <head>
          <title>User Verification Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: blue; }
            p { font-size: 16px; }
          </style>
        </head>
        <body>
          <h1>Verification Report</h1>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Verification Status:</strong> Verified ✅</p>
        </body>
        </html>
      `;

      // Header and Footer Templates
      const headerTemplate = `
        <div style="font-size: 10px; width: 100%; text-align: center; padding: 5px; border-bottom: 1px solid #ccc;">
          <span>User Verification Report - ${userName}</span>
        </div>
      `;

      const footerTemplate = `
        <div style="font-size: 10px; width: 100%; text-align: center; padding: 5px; border-top: 1px solid #ccc;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `;

      // Launch Puppeteer
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      // Generate PDF with Header & Footer
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        margin: {
          top: "40px",
          bottom: "40px",
        },
      });

      await browser.close();

      // Convert buffer to readable stream and pipe to Cloudinary
      const bufferStream = new stream.PassThrough();
      bufferStream.end(pdfBuffer);

      // Upload PDF to Cloudinary
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          {
            resource_type: "raw", // Ensures Cloudinary treats it as a file
            folder: "user_pdfs",
            public_id: `user_${userId}`,
            format: "pdf", // Ensures proper file extension
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log("PDF uploaded successfully:", result.secure_url);
              uploadedFiles.push({
                userId,
                userName,
                pdfUrl: result.secure_url,
              });
              resolve(result);
            }
          }
        );

        bufferStream.pipe(uploadStream);
      });

      await uploadPromise; // Ensure each PDF uploads before proceeding
    }

    res.status(200).json({
      message: "PDFs generated and uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
