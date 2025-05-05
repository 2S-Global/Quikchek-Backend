const OtpGeneratePDF = ({ user }) => {
  const logo =
    "https://res.cloudinary.com/da4unxero/image/upload/v1746082140/QuikChek%20images/yfkxavqtaqqubl96zadp.png";
  const verifiedlogo =
    "https://res.cloudinary.com/da4unxero/image/upload/v1746423837/QuikChek%20images/wy0gvhzwwjorpasihucf.png";
  const unverifiedlogo =
    "https://res.cloudinary.com/da4unxero/image/upload/v1746423901/QuikChek%20images/otptu7jh6ontg8sr2xem.png";
  const notapplicablelogo =
    "https://res.cloudinary.com/da4unxero/image/upload/v1746423964/QuikChek%20images/wrxu8see8swig14psk2j.png";

  const userId = user._id.toString();
  const userName = user.candidate_name ?? "N/A";
  const dob = user.candidate_dob;
  const dobDate = new Date(dob);

  const day = String(dobDate.getDate()).padStart(2, "0");
  const month = String(dobDate.getMonth() + 1).padStart(2, "0");
  const year = dobDate.getFullYear();
  const formattedDob = `${day}/${month}/${year}`;
  const phone = user.candidate_mobile ?? "N/A";
  const Email = user.candidate_email ?? "N/A";
  const GenderRaw = user?.candidate_gender ?? "N/A";
  const Gender =
    GenderRaw.charAt(0).toUpperCase() + GenderRaw.slice(1).toLowerCase();

  const verification_time = new Date(user.createdAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const htmlHead = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>User Information</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
    <style>
      html, body {
        height: 100%;
        margin: 0;
        line-height: 1.2;
      }
      .wrapper {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .content {
        flex: 1;
      }
      .powered-by {
        text-align: center;
        font-size: 14px;
       
        margin-top: 20px;
        padding: 10px 0;
      }
    </style>
  </head>
  <body>
  <div class="wrapper">
    <div class="container mt-2 small content">
  `;

  const candidateInfo = `
  <h4 class="text-primary">Candidate Information</h4>
<div class="row g-1">
  <div class="col-md-6"><div class="mb-1"><strong>Full Name:</strong> ${
    userName ?? "N/A"
  }</div></div>
  <div class="col-md-6"><div class="mb-1"><strong>Date Of Birth:</strong> ${
    formattedDob ?? "N/A"
  }</div></div>
  <div class="col-md-6"><div class="mb-1"><strong>Phone Number:</strong> ${
    phone ?? "N/A"
  }</div></div>
  <div class="col-md-6"><div class="mb-1"><strong>Email:</strong> ${
    Email ?? "N/A"
  }</div></div>
  <div class="col-md-6"><div class="mb-1"><strong>Address:</strong> ${
    user.candidate_address ?? "N/A"
  }</div></div>
  <div class="col-md-6"><div class="mb-1"><strong>Gender:</strong> ${
    Gender ?? "N/A"
  }</div></div>
</div>
  `;

  const verificationDetails = `
  <h4 class="text-primary mt-2">
    Verification Details
    <span class="text-muted fs-6">(Verified at: ${verification_time})</span>
  </h4>
  `;

  /* Aahaar */
  const aadhaarStatus = !user?.aadhaar_response
    ? { src: notapplicablelogo, alt: "N/A" }
    : user?.aadhaar_response?.response_code == 100
    ? { src: verifiedlogo, alt: "Verified" }
    : { src: unverifiedlogo, alt: "Not Verified" };

  const aadhaar_header = `<h5 class="fw-bold text-dark mb-2 d-flex align-items-center">
    AADHAAR
    <img
      src="${aadhaarStatus.src}"
      alt="${aadhaarStatus.alt}"
      class="ms-2"
      style="width: 80px; height: 20px;"
    />
  </h5>`;
  const aadhaarDetails = `
  <div class="col-md-12 mb-3" id="aadhaar_response">
    <div class="p-3 shadow-sm rounded bg-light">
      <div class="d-flex align-items-center mb-3">
        ${aadhaar_header}
       
      </div>
      <div class="mt-2">
        <!-- Photo on one side and other details on the other -->
        <div class="row">
          <div class="col-md-6 mb-3 text-center">
            <!-- This is heading -->
            <h5 class="fw-bold text-dark mb-2 me-2 d-block">Image as per Aadhaar</h5>
            <img
              src="${
                user?.aadhaar_response?.result?.user_profile_image
                  ? `data:image/jpeg;base64,${user.aadhaar_response.result.user_profile_image}`
                  : "/images/resource/no_user.png"
              }"
              alt="Profile"
              class="img-thumbnail rounded"
              style="max-width: 150px; max-height: 150px;"
            />
          </div>
          <div class="col-md-6 mb-3">
            <!-- This is heading -->
            <h5 class="fw-bold text-dark mb-3 d-block">Personal Details as per Aadhaar</h5>

            <div class="d-flex align-items-center mb-1">
              <span class="fw-bold me-2">Full Name:</span>
              <span class="text-break">
                ${user?.aadhaar_response?.result?.user_full_name || "N/A"}
              </span>
            </div>
            <div class="d-flex align-items-center mb-1">
              <span class="fw-bold me-2">Aadhaar Number:</span>
              <span class="text-break">
                ${user?.aadhaar_response?.result?.user_aadhaar_number || "N/A"}
              </span>
            </div>
            <div class="d-flex align-items-center mb-1">
              <span class="fw-bold me-2">DOB:</span>
              <span class="text-break">
                ${user?.aadhaar_response?.result?.user_dob || "N/A"}
              </span>
            </div>
            <div class="d-flex align-items-center mb-1">
              <span class="fw-bold me-2">Gender:</span>
              <span class="text-break">
                ${user?.aadhaar_response?.result?.user_gender || "N/A"}
              </span>
            </div>
            <div class="d-flex mb-1">
              <span class="fw-bold me-2">Address:</span>
              <span class="text-break flex-grow-1">
                ${
                  [
                    user?.aadhaar_response?.result?.user_address?.house,
                    user?.aadhaar_response?.result?.user_address?.street,
                    user?.aadhaar_response?.result?.user_address?.landmark,
                    user?.aadhaar_response?.result?.user_address?.loc,
                    user?.aadhaar_response?.result?.user_address?.po,
                    user?.aadhaar_response?.result?.user_address?.vtc,
                    user?.aadhaar_response?.result?.user_address?.subdist,
                    user?.aadhaar_response?.result?.user_address?.dist,
                    user?.aadhaar_response?.result?.user_address?.state,
                    user?.aadhaar_response?.result?.user_address?.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "N/A"
                }
              </span>
            </div>
            <div class="d-flex align-items-center mb-1">
              <span class="fw-bold me-2">Zipcode:</span>
              <span class="text-break">
                ${user?.aadhaar_response?.result?.address_zip || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

  const poweredBy = `
  <div class="powered-by">
    Powered by<br />
    <img src="${logo}" alt="User Photo" width="120" style="margin-top: 5px;" />
  </div>`;

  const footer = `
    <div class="footer text-center mt-4">
    <p class="text-muted">-- End of Report --</p>
    </div>
    `;

  const htmlEnd = `
    </div> <!-- end of .content -->
  
   
  </div> <!-- end of .wrapper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  </body>
  </html>
  `;

  const htmlContent = `
  ${htmlHead}
  ${candidateInfo}
  ${verificationDetails}
  <div class="row mt-4">
    
       ${aadhaarDetails}
  
       
  </div>
  ${footer}
  ${htmlEnd}
  `;

  return htmlContent;
};

export default OtpGeneratePDF;
