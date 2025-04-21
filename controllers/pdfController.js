import UserVerification from "../models/userVerificationModel.js";
import puppeteer from "puppeteer";
import cloudinary from "cloudinary";
import stream from "stream";
import { exit } from "process";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generatePDF = async (req, res) => {
  try {
    const verifiedUsers = await UserVerification.find({
      all_verified: 1,
    }).limit(2);

    if (verifiedUsers.length === 0) {
      return res.status(404).json({ message: "No verified users found" });
    }

    let uploadedFiles = [];

    // **Launch Puppeteer Once**
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    for (const user of verifiedUsers) {
      try {
        const userId = user._id.toString();
        const userName = user.candidate_name;
        const dob = user.candidate_dob; // "2000-10-13"
        const dobDate = new Date(dob);

        const day = String(dobDate.getDate()).padStart(2, "0");
        const month = String(dobDate.getMonth() + 1).padStart(2, "0");
        const year = dobDate.getFullYear();
        const formattedDob = `${day}/${month}/${year}`;
        const phone = user.candidate_mobile;

        // **HTML Content with Bootstrap**
        const htmlContent = `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>User Information</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
  </head>
  <body>
    <div class="container mt-2 small">
      <h2 class="text-primary">User Information</h2>
      <div class="row g-1">
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
          <div class="mb-1"><strong>Email:</strong> abc@gmail.com</div>
        </div>
        <div class="col-md-6">
          <div class="mb-1"><strong>Address:</strong> KOLKATA</div>
        </div>
        <div class="col-md-6">
          <div class="mb-1"><strong>Gender:</strong> Male</div>
        </div>
      </div>

      <h2 class="text-primary mt-2">
        Verification Details
        <span class="text-muted fs-6">(Verified at: 02/04/2025)</span>
      </h2>

      <div class="row">
        <!-- PAN Card Details -->
        <div class="col-md-4 mb-3" id="pan_response">
          <div class="p-3 shadow-sm rounded bg-light">
            <h5 class="fw-bold text-dark mb-2">PAN</h5>
            <div class="mb-1"><strong>Full Name:</strong> Demo User</div>
            <div class="mb-1"><strong>PAN Number:</strong> ABC123456</div>
            <div class="mb-1"><strong>Type:</strong> Individual</div>
          </div>
        </div>

        <!-- Passport Details -->
        <div class="col-md-4 mb-3" id="passport_response">
          <div class="p-3 shadow-sm rounded bg-light">
            <h5 class="fw-bold text-dark mb-2">PASSPORT</h5>
            <div class="mb-1"><strong>Full Name:</strong> Demo User</div>
            <div class="mb-1"><strong>Number:</strong> ABC1234567890</div>
            <div class="mb-1"><strong>Applied Date:</strong> 13/08/2020</div>
          </div>
        </div>

        <!-- Aadhaar Details -->
        <div class="col-md-4 mb-3" id="aadhaar_response">
          <div class="p-3 shadow-sm rounded bg-light">
            <h5 class="fw-bold text-dark mb-2">Aadhaar</h5>
            <div class="mb-1"><strong>Aadhaar Number:</strong> 123456</div>
            <div class="mb-1"><strong>State:</strong> West Bengal</div>
            <div class="mb-1"><strong>Gender:</strong> Male</div>
          </div>
        </div>

        <div class="col-md-6 mb-3" id="dl_response">
          <div class="p-3 shadow-sm rounded bg-light">
            <div class="d-flex align-items-center mb-2">
              <h5 class="fw-bold text-dark mb-0 me-2">Driving License</h5>
            </div>
            <div class="mt-2">
              <div class="row">
                <div class="col-md-6 text-center mb-2"></div>
                <div class="col-md-6 p-3">
                  <div class="row">
                    <div class="col-md-12 mb-2">
                      <strong>Full Name:</strong> N/A
                    </div>
                    <div class="col-md-12 mb-2">
                      <strong>DL Number:</strong> N/A
                    </div>
                    <div class="col-md-12 mb-2">
                      <strong>Date of Birth:</strong> N/A
                    </div>
                  </div>
                </div>
              </div>
              <div class="row mt-2">
                <div class="col-md-6 mb-2">
                  <strong>Father/Husband Name:</strong> N/A
                </div>
                <div class="col-md-6 mb-2">
                  <strong>License State:</strong> N/A
                </div>
                <div class="col-md-6 mb-2">
                  <strong>License Status:</strong> N/A
                </div>
                <div class="col-md-6 mb-2">
                  <strong>Blood Group:</strong> N/A
                </div>
                <div class="col-md-6 mb-2">
                  <strong>Expiry Date:</strong> N/A
                </div>
                <div class="col-md-6 mb-2">
                  <strong>Issued Date:</strong> N/A
                </div>
              </div>
              <div class="row mt-2">
                <div class="col-md-6">
                  <h6 class="fw-bold">Permanent Address</h6>
                  <p class="small">
                    <strong>Address:</strong> abcd <br />
                    <br />
                    <strong>District:</strong>KOLKATA <br />
                    <strong>State:</strong> West Bengal <br />
                    <strong>Pin Code:</strong> 700156<br />
                    <strong>Country:</strong> India <br />
                  </p>
                </div>
                <div class="col-md-6">
                  <h6 class="fw-bold">Present Address</h6>
                  <p class="small">
                    <strong>Address:</strong> abcd <br />
                    <br />
                    <strong>District:</strong>KOLKATA <br />
                    <strong>State:</strong> West Bengal <br />
                    <strong>Pin Code:</strong> 700156<br />
                    <strong>Country:</strong> India <br />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-3" id="epic_response">
          <div class="p-3 shadow-sm rounded bg-light">
            <div class="d-flex align-items-center mb-2">
              <h5 class="fw-bold text-dark mb-0 me-2">EPIC</h5>
            </div>
            <div class="mt-2">
              <div class="mb-2">
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">EPIC ID:</span>
                  <span class="text-break"> 1519865419864984 </span>
                </div>
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">Name:</span>
                  <span class="text-break"> Demo name </span>
                </div>
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">Gender:</span>
                  <span class="text-break"> Male </span>
                </div>
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">Age:</span>
                  <span class="text-break"> 25 </span>
                </div>
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">Status:</span>
                  <span class="text-break">Active</span>
                </div>
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2"> Relative Name: </span>
                  <span class="text-break"> Demo name relative </span>
                </div>
              </div>

              <div class="mb-2">
                <h5 class="fw-bold">Location Details</h5>
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">District:</span>
                  <span class="text-break"> Kolkata (123) </span>
                </div>
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">State:</span>
                  <span class="text-break"> West Bengal (123) </span>
                </div>
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">Assembly Constituency:</span>
                  <span class="text-break">
                    Demo Assembly Constituency (123)
                  </span>
                </div>
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">Parliamentary Constituency:</span>
                  <span class="text-break">
                    Demo Parliamentary Constituency (123456)
                  </span>
                </div>
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">Constituency Part Name:</span>
                  <span class="text-break">
                    Demo Constituency Part Name (123)
                  </span>
                </div>
              </div>
              <div class="mb-2">
                <h5 class="fw-bold">Polling Booth Details</h5>
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">Polling Booth:</span>
                  <span class="text-break"> Demo Polling Booth (123) </span>
                </div>
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">Location:</span>
                  <span class="text-break"> Kolkata </span>
                </div>
                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">
                    Serial Number Applicable Part:
                  </span>
                  <span class="text-break"> 123 </span>
                </div>

                <div class="d-flex align-items-center mb-1">
                  <span class="fw-bold me-2">Last Updated:</span>
                  <span class="text-break"> 13/08/2020 </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  </body>
</html>
  `;

        // Header Template (Proper Puppeteer Formatting)
        const headerTemplate = `
          <div style="width: 100%; text-align: center; font-size: 12px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 2; text-align: center;">
                <h2 style="margin: 0; color: #333;">E2 Score</h2>
                <p style="margin: 0; font-size: 10px;">1234 Elm Street, Springfield, IL 62704</p>
                <p style="margin: 0; font-size: 10px;">abc@gmail.com | 1234567890</p>
              </div>
            </div>
          </div>
        `;

        // Footer Template (Fixes Page Number Issue)
        const footerTemplate = `
          <div style="width: 100%; text-align: center; padding: 5px; font-size: 10px; border-top: 1px solid #ccc;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        `;

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "networkidle2" });

        const pdfBuffer = await page.pdf({
          format: "A4",
          printBackground: true,
          displayHeaderFooter: true,
          headerTemplate,
          footerTemplate,
          margin: {
            top: "80px",
            bottom: "40px",
          },
        });

        await page.close();

        const publicId = `user_pdfs/user_${userId}.pdf`;

        try {
          const result = await cloudinary.v2.api.resource(publicId, {
            resource_type: "raw",
            type: "upload",
          });

          const deleteResult = await cloudinary.v2.uploader.destroy(publicId, {
            resource_type: "raw",
            type: "upload",
          });

          if (deleteResult.result === "ok") {
            console.log(`Old PDF deleted for user ${userId}`);
          } else {
            console.log(`No existing PDF found for user ${userId}`);
          }
        } catch (err) {
          console.error(
            `Error while checking/deleting old file for ${userId}:`,
            err.error?.message || err
          );
        }

        // **Upload to Cloudinary**
        const bufferStream = new stream.PassThrough();
        bufferStream.end(pdfBuffer);
        // Upload new file
        const uploadPromise = new Promise((resolve, reject) => {
          const uploadStream = cloudinary.v2.uploader.upload_stream(
            {
              resource_type: "raw",
              folder: "user_pdfs",
              public_id: `user_${userId}`,
              format: "pdf",
              type: "upload",
            },
            (error, result) => {
              if (error) {
                console.error(`Cloudinary upload failed for ${userId}:`, error);
                reject(error);
              } else {
                console.log(`PDF uploaded: ${result.secure_url}`);
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

        await uploadPromise;
      } catch (userError) {
        console.error(`Error processing user ${user._id}:`, userError);
      }
    }

    await browser.close();

    res.status(200).json({
      message: "PDFs generated and uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
