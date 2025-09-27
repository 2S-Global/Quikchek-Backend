const InvoiceGenerate = ({ data }) => {
  // console.log("data", data);

  const htmlHead = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <style>
      .invoice-title {
        font-weight: bold;
        font-size: 1.5rem;
      }
      .company-name {
        color: #5e9ca0; /* teal-like color */
        font-weight: 600;
      }
      .company-details {
        font-size: 0.9rem;
        color: #555;
      }
    </style>
  </head>
  <body>`;
  const heading = ` <div class="container mt-4">
      <div class="justify-content-end">
        <div class="text-end">
          <div class="invoice-title">INVOICE</div>
          <div class="company-name">
            2S GLOBAL TECHNOLOGIES LIMITED
          </div>
          <div class="company-name">GST: 19AAVCS5999N1ZR</div>
          <div class="company-details">
            Unit-404, 4th Floor, Webel IT Park (Phase-II),Rajarhat,<br />
            DH Block (Newtown), Action Area 1D,<br />
            Newtown, West Bengal 700160.
          </div>
          <div class="company-details">support@quikchek.in | 00348101495</div>
        </div>
      </div>
    </div>
    <hr />`;

  const createdAt = new Date(data.all_status.createdAt);
  const formatted = createdAt.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const billing = ` <div class="container mt-4">
      <div class="row">
        <div class="col-md-6">
          <h5>Bill To:</h5>
          <p>
            ${data.company_details.name}<br />
            ${data.company_details.address}<br />
            ${data.company_details.email}<br />
            ${data.company_details.phone_number}<br />
          </p>
        </div>
        <div class="col-md-6 text-end">
          <h5>Invoice Details:</h5>
          <p>
            Invoice Number: ${data.all_status.invoice_number}<br />
            Invoice Date: ${formatted}<br />
          </p>
        </div>
      </div>
    </div>`;

  const table = `
    <div class="container mt-4">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Mobile Number</th>
            <th>Pay For</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.payments
            .map(
              (payment, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${payment.candidate_name || ""}</td>
                  <td>${payment.candidate_mobile || "N/A"}</td>
                  <td>${payment.payFor}</td>
                  <td>₹ ${payment.amount || 0}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  const subTotal = Number(data.all_status.subtotal || 0);
  const discountPercentage = Number(data.all_status.discount_percentage || 0);
  const discount = Number(data.all_status.discount_amount || 0);
  const sgstPercentage = Number(data.all_status.sgst_percent || 0);
  const cgstPercentage = Number(data.all_status.cgst_percent || 0);

  const sgst = Number(data.all_status.sgst || 0);
  const cgst = Number(data.all_status.cgst || 0);
  const total = Number(data.all_status.total_amount || 0);
  const total_calculation = `   <div class="container mt-4 bg-light rounded">
      <p class="d-flex justify-content-between mb-1">
        <span>Sub-Total :</span> <span>${subTotal?.toFixed(2)} INR</span>
      </p>
      <p class="d-flex justify-content-between mb-1">
        <span>Discount (${data.all_status.discount_percent}%) :</span>
        <span>- ${discount?.toFixed(2)} INR</span>
      </p>

      <p class="d-flex justify-content-between mb-1">
        <span>SGST (${sgstPercentage}%) :</span>
        <span>${sgst?.toFixed(2)} INR</span>
      </p>
      <p class="d-flex justify-content-between mb-1">
        <span>CGST (${cgstPercentage}%) :</span>
        <span>${cgst?.toFixed(2)} INR</span>
      </p>
      <p class="d-flex justify-content-between fw-bold fs-5">
        <span>Total :</span> <span>${total?.toFixed(2)} INR</span>
      </p>
    </div>`;

  const htmlTail = `</body>
</html>`;

  const htmlContent = `
  ${htmlHead}
  ${heading}
  ${billing}
  ${table}
  ${total_calculation}
  ${htmlTail}
  `;
  return htmlContent;
};
export default InvoiceGenerate;
