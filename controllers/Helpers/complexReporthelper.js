const complexReportHelper = ({ data, startDate, endDate }) => {
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  let dateline = "";

  if (startDate && endDate) {
    dateline = `Date: ${formatDate(startDate)} to ${formatDate(endDate)}`;
  } else if (startDate && !endDate) {
    dateline = `Date: From  ${formatDate(startDate)}`;
  } else if (!startDate && endDate) {
    dateline = `Date: Upto ${formatDate(endDate)}`;
  }

  const heading = ` <div class="container ">
        <div class="text-center">
          <div class="invoice-title">Owner Payment Record</div>
            <div class="company-details">
              ${dateline}
          </div>
        </div>
    </div>
  `;

  const table = `
  <style>
    .page-break {
      page-break-after: always;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #000;
      padding: 8px;
      text-align: center;
    }
    th {
      background-color: #f2f2f2;
    }
  </style>

  <div class="container mt-4">
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Name</th>
          <th>Owner Details</th>
          <th>Documents</th>
          <th>Amount</th>                 
        </tr>
      </thead>
      <tbody>
        ${data
          .map((payment, index) => {
            const row = `
              <tr>
                <td>${index + 1}</td>
                <td>${
                  payment.createdAt ? formatDate(payment.createdAt) : ""
                }</td>
                <td>${payment.candidate_name || ""}</td>
                <td>${
                  payment.owner_id
                    ? `${payment.owner_id.name || "N/A"} (${
                        payment.owner_id.flat_no || "N/A"
                      })`
                    : "N/A"
                }</td>
                <td>${payment.document || "N/A"}</td>
                <td>₹ ${payment.order_ref_id?.total_amount || "0"}</td>
              </tr>
            `;

            // Insert page break after every 3 rows
            const pageBreak =
              (index + 1) % 7 === 0 ? `<tr class="page-break"></tr>` : "";

            return row + pageBreak;
          })
          .join("")}

          <tr>
           <td colSpan="4" style={{ textAlign: "center" }}>
                      
                      </td>
                      <td colSpan="1" style={{ textAlign: "center" }}>
                        Total
                      </td>
                      <td colSpan="1" style={{ textAlign: "center" }}>
                        ₹ ${" "}
                        ${data
                          .reduce(
                            (total, payment) =>
                              total +
                              (parseFloat(payment.order_ref_id?.total_amount) ||
                                0),
                            0
                          )
                          .toFixed(2)}
                      </td>
                    </tr>




      </tbody>
    </table>
  </div>
`;

  const htmlTail = `</body>
</html>`;

  const htmlcontent = `${htmlHead}${heading}
    ${table}${htmlTail}`;
  return htmlcontent;
};

export default complexReportHelper;
