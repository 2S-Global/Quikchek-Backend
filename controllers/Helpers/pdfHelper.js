const GeneratePDF = ({ user }) => {
  const logo =
    "https://res.cloudinary.com/da4unxero/image/upload/v1746082140/QuikChek%20images/yfkxavqtaqqubl96zadp.png";
  const userId = user._id.toString();
  const userName = user.candidate_name;
  const dob = user.candidate_dob;
  const dobDate = new Date(dob);

  const day = String(dobDate.getDate()).padStart(2, "0");
  const month = String(dobDate.getMonth() + 1).padStart(2, "0");
  const year = dobDate.getFullYear();
  const formattedDob = `${day}/${month}/${year}`;
  const phone = user.candidate_mobile;
  const Email = user.candidate_email;
  const Gender = user?.candidate_gender ?? "N/A";
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
  <div class="col-md-6"><div class="mb-1"><strong>Full Name:</strong> ${userName}</div></div>
  <div class="col-md-6"><div class="mb-1"><strong>Date Of Birth:</strong> ${formattedDob}</div></div>
  <div class="col-md-6"><div class="mb-1"><strong>Phone Number:</strong> ${phone}</div></div>
  <div class="col-md-6"><div class="mb-1"><strong>Email:</strong> ${Email}</div></div>
  <div class="col-md-6"><div class="mb-1"><strong>Address:</strong> ${user.candidate_address}</div></div>
  <div class="col-md-6"><div class="mb-1"><strong>Gender:</strong> ${Gender}</div></div>
</div>
`;

  const verificationDetails = `
<h4 class="text-primary mt-2">
  Verification Details
  <span class="text-muted fs-6">(Verified at: ${verification_time})</span>
</h4>
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
    <div class="mb-2">
  <strong class="me-2">Full Name:</strong>
  <span>
    ${
      user?.passport_response?.result?.name_on_passport &&
      user?.passport_response?.result?.customer_last_name
        ? `${user.passport_response.result.name_on_passport} ${user.passport_response.result.customer_last_name}`
        : user?.passport_response?.result?.name_on_passport ||
          user?.passport_response?.result?.customer_last_name ||
          "N/A"
    }
  </span>
</div>

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
    <div class="mb-1"><strong>State:</strong> ${
      user?.aadhaar_response?.result?.state ?? "N/A"
    }</div>
    <div class="mb-1"><strong>Gender:</strong> ${
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
   <div class="col-md-7 mb-4" id="dl_response">
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
                 type === "Permanent" ? permanentAddress : presentAddress;
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
                         <strong>State:</strong> ${address.state || "N/A"}<br />
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
<div class="col-md-5 mb-4" id="epic_response">
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

   <div class="mb-2">
  <span class="fw-bold">Assembly Constituency:</span><br />
  <span class="text-break">
    ${epicResult?.assembly_constituency_name || "N/A"} (
    ${epicResult?.assembly_constituency_number || "N/A"})
  </span>
</div>

<div class="mb-2">
  <span class="fw-bold">Parliamentary Constituency:</span><br />
  <span class="text-break">
    ${epicResult?.parliamentary_constituency_name || "N/A"} (
    ${epicResult?.parliamentary_constituency_number || "N/A"})
  </span>
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
<div class="row">
   ${panDetails}
     ${passportDetails}
     ${aadhaarDetails}
     ${drivingLicenseDetails}
     ${epicDetails}
</div>
${htmlEnd}
`;

  return htmlContent;
};

export default GeneratePDF;
