import UserVerification from "../models/userVerificationModel.js";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export const generatePDF = async (req, res) => {
  // Get order_id from request or use default for testing
  const order_id = req.body.order_id || "67fd02d36b16e7a74feff537";

  try {
    // Find the verification document by ID
    const verifiedUser = await UserVerification.findById(order_id);

    if (!verifiedUser) {
      return res.status(404).json({ message: "No verified user found" });
    }

    // Launch Puppeteer with specific options that help with PDF rendering
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Addresses memory issues in containerized environments
        "--font-render-hinting=none", // Improves text rendering in PDFs
      ],
    });

    try {
      // Format user data
      const userName = verifiedUser.candidate_name || "N/A";
      const dob = verifiedUser.candidate_dob; // "2000-10-13"

      // Safely format date with error handling
      let formattedDob = "N/A";
      if (dob) {
        try {
          const dobDate = new Date(dob);
          if (!isNaN(dobDate.getTime())) {
            // Check if date is valid
            const day = String(dobDate.getDate()).padStart(2, "0");
            const month = String(dobDate.getMonth() + 1).padStart(2, "0");
            const year = dobDate.getFullYear();
            formattedDob = `${day}/${month}/${year}`;
          }
        } catch (dateError) {
          console.error("Error formatting date:", dateError);
        }
      }

      const phone = verifiedUser.candidate_mobile || "N/A";
      const Email = verifiedUser.candidate_email || "N/A";
      const Gender = verifiedUser?.candidate_gender || "N/A";
      const address = verifiedUser.candidate_address || "N/A";

      // Format verification time
      let verification_time = "N/A";
      if (verifiedUser.createdAt) {
        try {
          verification_time = new Date(verifiedUser.createdAt).toLocaleString(
            "en-IN",
            {
              timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            }
          );
        } catch (timeError) {
          console.error("Error formatting time:", timeError);
        }
      }

      // HTML Content with inline CSS instead of Bootstrap to ensure proper rendering
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>User Verification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            h2 {
              color: #0d6efd;
              margin-top: 20px;
              margin-bottom: 10px;
              font-size: 18px;
            }
            .row {
              display: flex;
              flex-wrap: wrap;
              margin-right: -15px;
              margin-left: -15px;
            }
            .col-md-6, .col-md-4 {
              position: relative;
              width: 100%;
              padding-right: 15px;
              padding-left: 15px;
              margin-bottom: 15px;
            }
            .col-md-6 {
              flex: 0 0 50%;
              max-width: 50%;
            }
            .col-md-4 {
              flex: 0 0 33.333333%;
              max-width: 33.333333%;
            }
            .mb-1 {
              margin-bottom: 5px;
            }
            .mb-2 {
              margin-bottom: 10px;
            }
            .mb-3 {
              margin-bottom: 15px;
            }
            .p-3 {
              padding: 15px;
            }
            .bg-light {
              background-color: #f8f9fa;
            }
            .shadow-sm {
              box-shadow: 0 .125rem .25rem rgba(0,0,0,.075);
            }
            .rounded {
              border-radius: 5px;
            }
            .text-muted {
              color: #6c757d;
            }
            .fs-6 {
              font-size: 14px;
            }
            .fw-bold {
              font-weight: bold;
            }
            strong {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Candidate Information</h2>
            <div class="row">
              <div class="col-md-6">
                <div class="mb-1"><strong>Full Name:</strong> ${userName}</div>
              </div>
              <div class="col-md-6">
                <div class="mb-1"><strong>Date Of Birth:</strong> ${formattedDob}</div>
              </div>
              <div class="col-md-6">
                <div class="mb-1"><strong>Phone Number:</strong> ${phone}</div>
              </div>
              <div class="col-md-6">
                <div class="mb-1"><strong>Email:</strong> ${Email}</div>
              </div>
              <div class="col-md-6">
                <div class="mb-1"><strong>Address:</strong> ${address}</div>
              </div>
              <div class="col-md-6">
                <div class="mb-1"><strong>Gender:</strong> ${Gender}</div>
              </div>
            </div>
            
            <h2>Verification Details <span class="text-muted fs-6">(Verified at: ${verification_time})</span></h2>
            <div class="row">
              <div class="col-md-4 mb-3">
                <div class="p-3 shadow-sm rounded bg-light">
                  <h5 class="fw-bold mb-2">PAN</h5>
                  <div class="mb-1"><strong>Full Name:</strong> ${
                    verifiedUser?.pan_response?.result?.user_full_name ?? "N/A"
                  }</div>
                  <div class="mb-1"><strong>PAN Number:</strong> ${
                    verifiedUser?.pan_response?.result?.pan_number ?? "N/A"
                  }</div>
                  <div class="mb-1"><strong>Type:</strong> ${
                    verifiedUser?.pan_response?.result?.pan_type ?? "N/A"
                  }</div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="p-3 shadow-sm rounded bg-light">
                  <h5 class="fw-bold mb-2">PASSPORT</h5>
                  <div class="mb-1"><strong>Full Name:</strong> ${
                    verifiedUser?.passport_response?.result?.name_on_passport ??
                    "N/A"
                  }</div>
                  <div class="mb-1"><strong>Number:</strong> ${
                    verifiedUser?.passport_response?.result?.passport_number ??
                    "N/A"
                  }</div>
                  <div class="mb-1"><strong>Applied Date:</strong> ${
                    verifiedUser?.passport_response?.result
                      ?.passport_applied_date ?? "N/A"
                  }</div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create a new page with specific viewport for better PDF output
      const page = await browser.newPage();
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 1,
      });

      // Set content with specific wait until conditions
      await page.setContent(htmlContent, {
        waitUntil: ["load", "networkidle0"],
      });

      // Header Template
      const headerTemplate = `
        <div style="width: 100%; font-size: 10px; text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
          <div style="margin: 0 auto; text-align: center;">
            <div style="text-align: center;">
              <h2 style="margin: 0; color: #333; font-size: 14px;">QUIKCHEK</h2>
              <p style="margin: 0; font-size: 8px;">1234 Elm Street, Springfield, IL 62704</p>
              <p style="margin: 0; font-size: 8px;">abc@gmail.com | 1234567890</p>
            </div>
          </div>
        </div>
      `;

      // Footer Template
      const footerTemplate = `
        <div style="width: 100%; font-size: 8px; text-align: center; border-top: 1px solid #ccc; padding-top: 5px;">
          <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 20px;">
            <span>Verified by QuikCheck using Digilocker</span>
            <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          </div>
        </div>
      `;

      // Generate PDF with robust settings
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        margin: {
          top: "70px",
          bottom: "70px",
          left: "20px",
          right: "20px",
        },
        preferCSSPageSize: false,
        timeout: 60000, // Increased timeout
      });

      await page.close();
      await browser.close();

      // Optional: Save the PDF to disk for debugging

      const tempDir = path.join(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const filePath = path.join(tempDir, `verification_${order_id}.pdf`);
      fs.writeFileSync(filePath, pdfBuffer);
      console.log(`PDF saved to ${filePath}`);

      // Send the PDF as a response
      res.contentType("application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=verification_${order_id}.pdf`
      );
      return res.send(pdfBuffer);
    } catch (error) {
      if (browser) await browser.close();
      console.error("Error generating PDF:", error);
      return res.status(500).json({
        message: "Error generating PDF",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error retrieving user verification:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
