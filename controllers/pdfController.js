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
    }).limit(3);

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
        const Email = user.candidate_email;
        const Gender = user?.candidate_gender ?? "N/A";

        const verification_time = new Date(user.createdAt).toLocaleString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true, // for AM/PM format
          }
        );

        // **HTML Content with Bootstrap**
        const htmlHead = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>User Information</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        </head>
        <body>
        <div class="container mt-2 small">
        `;

        const candidateInfo = `
        <h2 class="text-primary">Candidate Information</h2>
        <div class="row g-1">
          <div class="col-md-6"><div class="mb-1"><strong>Full Name:</strong> ${userName}</div></div>
          <div class="col-md-6"><div class="mb-1"><strong>Date Of Birth:</strong> ${formattedDob}</div></div>
          <div class="col-md-6"><div class="mb-1"><strong>Phone Number:</strong> ${phone}</div></div>
          <div class="col-md-6"><div class="mb-1"><strong>Email:</strong> ${Email}</div></div>
          <div class="col-md-6"><div class="mb-1"><strong>Address:</strong> ${user.candidate_address}</div></div>
          <div class="col-md-6"><div class="mb-1"><strong>Gender:</strong> ${Gender}</div></div>
        </div>
        `;
        console.log("Gender:", Gender);

        const verificationDetails = `
        <h2 class="text-primary mt-2">
          Verification Details
          <span class="text-muted fs-6">(Verified at: ${verification_time})</span>
        </h2>
        `;

        const panDetails = `
  <div class="col-md-4 mb-3" id="pan_response">
    <div class="p-3 shadow-sm rounded bg-light">
      <h5 class="fw-bold text-dark mb-2">PAN</h5>
      <div class="mb-1"><strong>Full Name:</strong> ${
        user?.pan_response?.result?.user_full_name ?? "N/A"
      }</div>
      <div class="mb-1"><strong>PAN Number:</strong> ${
        user?.pan_response?.result?.pan_number ?? "N/A"
      }</div>
      <div class="mb-1"><strong>Type:</strong> ${
        user?.pan_response?.result?.pan_type ?? "N/A"
      }</div>
    </div>
  </div>
`;

        const passportDetails = `
        <div class="col-md-4 mb-3" id="passport_response">
          <div class="p-3 shadow-sm rounded bg-light">
            <h5 class="fw-bold text-dark mb-2">PASSPORT</h5>
            <div class="mb-1"><strong>Full Name:</strong> ${
              user?.passport_response?.result?.name_on_passport ?? "N/A"
            }</div>
            <div class="mb-1"><strong>Number:</strong> ${
              user?.passport_response?.result?.passport_number ?? "N/A"
            }</div>
            <div class="mb-1"><strong>Applied Date:</strong> 
      ${user?.passport_response?.result?.passport_applied_date ?? "N/A"}
            </div>
          </div>
        </div>
        `;

        const aadhaarDetails = `
        <div class="col-md-4 mb-3" id="aadhaar_response">
          <div class="p-3 shadow-sm rounded bg-light">
            <h5 class="fw-bold text-dark mb-2">Aadhaar</h5>
            <div class="mb-1"><strong>Aadhaar Number:</strong> ${
              user?.aadhaar_response?.result?.user_aadhaar_number ?? "N/A"
            }</div>
            <div class="mb-1"><strong>State:</strong>${
              user?.aadhaar_response?.result?.state ?? "N/A"
            }</div>
            <div class="mb-1"><strong>Gender:</strong>${
              user?.aadhaar_response?.result?.user_gender ?? "N/A"
            }</div>
          </div>
        </div>
        `;
        const dl = user?.dl_response?.result || {};
        const permanentAddress = dl?.user_address?.find(
          (addr) => addr.type === "Permanent"
        );
        const presentAddress = dl?.user_address?.find(
          (addr) => addr.type === "Present"
        );

        const drivingLicenseDetails = `
          <div class="col-md-6 mb-4" id="dl_response">
            <div class="p-3 shadow-sm rounded bg-light">
              <div class="d-flex align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0 me-2">Driving License</h5>
              </div>
              <div class="mt-2">
                <div class="row">
                  <div class="col-md-6 text-center mb-3">
                    ${
                      dl?.user_image
                        ? `<img src="data:image/jpeg;base64,${dl.user_image}" alt="Profile" class="img-thumbnail rounded" style="max-width:150px; max-height:150px;" />`
                        : `<p class="text-muted">No Image</p>`
                    }
                  </div>
                  <div class="col-md-6 p-3">
                    <div class="row">
                      <div class="col-md-12 mb-2"><strong>Full Name:</strong> ${
                        dl?.user_full_name || "N/A"
                      }</div>
                      <div class="col-md-12 mb-2"><strong>DL Number:</strong> ${
                        dl?.dl_number || "N/A"
                      }</div>
                      <div class="col-md-12 mb-2"><strong>Date of Birth:</strong> ${
                        dl?.user_dob || "N/A"
                      }</div>
                    </div>
                  </div>
                </div>
        
                <div class="row mt-2">
                  <div class="col-md-6 mb-2"><strong>Father/Husband Name:</strong> ${
                    dl?.father_or_husband || "N/A"
                  }</div>
                  <div class="col-md-6 mb-2"><strong>License State:</strong> ${
                    dl?.state || "N/A"
                  }</div>
                  <div class="col-md-6 mb-2"><strong>License Status:</strong> ${
                    dl?.status || "N/A"
                  }</div>
                  <div class="col-md-6 mb-2"><strong>Blood Group:</strong> ${
                    dl?.user_blood_group || "N/A"
                  }</div>
                  <div class="col-md-6 mb-2"><strong>Expiry Date:</strong> ${
                    dl?.expiry_date || "N/A"
                  }</div>
                  <div class="col-md-6 mb-2"><strong>Issued Date:</strong> ${
                    dl?.issued_date || "N/A"
                  }</div>
                </div>
        
                <div class="row mt-2">
                  ${["Permanent", "Present"]
                    .map((type) => {
                      const address =
                        type === "Permanent"
                          ? permanentAddress
                          : presentAddress;
                      const label = type === "Permanent" ? "Legal" : "Present";
                      return `
              <div class="col-md-6">
                <h6 class="fw-bold">${label} Address</h6>
                        ${
                          address
                            ? `
                              <p class="small">
                                ${address.completeAddress || "N/A"}<br />
                                <strong>District:</strong> ${
                                  address.district || "N/A"
                                }<br />
                                <strong>State:</strong> ${
                                  address.state || "N/A"
                                }<br />
                                <strong>Pin Code:</strong> ${
                                  address.pin || "N/A"
                                }<br />
                              </p>`
                            : `<p class="text-muted">N/A</p>`
                        }
                      </div>`;
                    })
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        `;
        const epicResult = user?.epic_response?.result || {};
        const epicDetails = `
  <div class="col-md-6 mb-4" id="epic_response">
    <div class="p-3 shadow-sm rounded bg-light">
      <div class="d-flex align-items-center mb-3">
        <h5 class="fw-bold text-dark mb-0 me-2">EPIC</h5>
      </div>

      <div class="mt-2">
        <div class="mb-3">
          <div class="d-flex align-items-center mb-1">
            <span class="fw-bold me-2">EPIC ID:</span>
            <span class="text-break">${epicResult?.epic_number || "N/A"}</span>
          </div>

          <div class="d-flex align-items-center mb-1">
            <span class="fw-bold me-2">Name:</span>
            <span class="text-break">${
              epicResult?.user_name_english
                ? epicResult.user_name_english
                    .toLowerCase()
                    .replace(/\b\w/g, (char) => char.toUpperCase())
                : "N/A"
            }</span>
          </div>

          <div class="d-flex align-items-center mb-1">
            <span class="fw-bold me-2">Gender:</span>
            <span class="text-break">${epicResult?.user_gender || "N/A"}</span>
          </div>

          <div class="d-flex align-items-center mb-1">
            <span class="fw-bold me-2">Age:</span>
            <span class="text-break">${epicResult?.user_age || "N/A"}</span>
          </div>

          <div class="d-flex align-items-center mb-1">
            <span class="fw-bold me-2">Status:</span>
            <span class="text-break">${epicResult?.status || "N/A"}</span>
          </div>

          <div class="d-flex align-items-center mb-1">
            <span class="fw-bold me-2">${
              epicResult?.relative_relation || "Relative"
            } Name:</span>
            <span class="text-break">${
              epicResult?.relative_name_english || "N/A"
            }</span>
          </div>
        </div>

        <div class="mb-3">
          <h5 class="fw-bold">Location Details</h5>

          <div class="d-flex align-items-center mb-1">
            <span class="fw-bold me-2">District:</span>
            <span class="text-break">
              ${epicResult?.address?.district_name || "N/A"} (${
          epicResult?.address?.district_code || "N/A"
        })
            </span>
          </div>

          <div class="d-flex align-items-center mb-1">
            <span class="fw-bold me-2">State:</span>
            <span class="text-break">
              ${epicResult?.address?.state || "N/A"} (${
          epicResult?.address?.state_code || "N/A"
        })
            </span>
          </div>

          <div class="d-flex align-items-center mb-1">
            <span class="fw-bold me-2">Assembly Constituency:</span>
            <span class="text-break">
              ${epicResult?.assembly_constituency_name || "N/A"} (${
          epicResult?.assembly_constituency_number || "N/A"
        })
            </span>
          </div>

          <div class="d-flex align-items-center mb-1">
            <span class="fw-bold me-2">Parliamentary Constituency:</span>
            <span class="text-break">
              ${epicResult?.parliamentary_constituency_name || "N/A"} (${
          epicResult?.parliamentary_constituency_number || "N/A"
        })
            </span>
          </div>

          <div class="d-flex align-items-center mb-1">
            <span class="fw-bold me-2">Constituency Part Name:</span>
            <span class="text-break">
              ${epicResult?.constituency_part_name || "N/A"} (${
          epicResult?.constituency_part_number || "N/A"
        })
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

        const htmlEnd = `
        </div> <!-- end of .row -->
        </div> <!-- end of .container -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
        `;

        const htmlContent = `
        ${htmlHead}
        ${candidateInfo}
        ${verificationDetails}
        <div class="row">
          ${panDetails}
          ${passportDetails}
          ${aadhaarDetails}
          ${drivingLicenseDetails}
          ${epicDetails}
        </div>
        ${htmlEnd}
        `;

        // Header Template (Proper Puppeteer Formatting)
        const headerTemplate = `
          <div style="width: 100%; text-align: center; font-size: 12px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 2; text-align: center;">
                <h2 style="margin: 0; color: #333;">QUIKCHEK</h2>
                <p style="margin: 0; font-size: 10px;">1234 Elm Street, Springfield, IL 62704</p>
                <p style="margin: 0; font-size: 10px;">abc@gmail.com | 1234567890</p>
              </div>
            </div>
          </div>
        `;

        // Footer Template (Fixes Page Number Issue)
        const footerTemplate = `
          <div style="width: 100%; text-align: center; padding: 5px; font-size: 10px; border-top: 1px solid #ccc;">
            <p style="font-size: 10px; text-align: right; margin: 0;">Verified by QuikCheck using Digilocker</p>
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
          <div>
          
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
