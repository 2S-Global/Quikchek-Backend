const ReportGenerator = ({ data, start_date, end_date }) => {
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

  const formattedStart = formatDate(start_date);
  const formattedEnd = formatDate(end_date);

  const heading = ` <div class="container ">
        <div class="text-center">
          <div class="invoice-title">Customer Payment Record</div>
            <div class="company-details">
    Date: ${formattedStart} to ${formattedEnd}
          </div>
        </div>
    </div>
  `;

  const table = `
  <style>
    .page-break {
      page-break-after: always;
    }
  </style>

  <div class="container mt-4">
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Sl.No</th>
          <th>Date</th>
          <th>Customer Details</th>
          <th>Amount</th>
          <th>GST</th>
          <th>Invoice Number</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map((payment, index) => {
            const row = `
              <tr>
                <td>${index + 1}</td>
              <td>${payment.date ? formatDate(payment.date) : ""}</td>
                <td>
                  Name : ${payment.customer_name} <br>
                  Email : ${payment.customer_email} <br>
                  Address : ${payment.customer_address}<br>
                  GST Number : ${payment.customer_gst}<br>
                </td>
                <td>₹ ${payment.amount}</td>
                <td>₹ ${payment.gst}</td>
                <td>
                 ${payment.invoice_no} 
                </td>
              </tr>
            `;

            // Insert page break after every 5 rows
            const pageBreak =
              (index + 1) % 3 === 0 ? `<tr class="page-break"></tr>` : "";

            return row + pageBreak;
          })
          .join("")}
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

export default ReportGenerator;
