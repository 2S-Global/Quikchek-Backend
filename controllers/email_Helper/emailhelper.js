import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const SendEmail = async ({ table_data, month_name, email, year }) => {
  const email_address = email.employer_id.email;
  const company_name = email.employer_id.name;

  console.log("email_address", email_address);
  console.log("company_name", company_name);

  const email_send = email_address;

  const table_html = `
  <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; margin-top: 20px;">
    <thead>
      <tr style="background-color: #f2f2f2;">
        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Sl. No</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Date</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Order No.</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Amount</th>
      </tr>
    </thead>
   <tbody>
  ${
    table_data.length > 0
      ? table_data
          .map(
            (item, index) => `
          <tr style="background-color: ${
            index % 2 === 0 ? "#ffffff" : "#f9f9f9"
          }; text-align: center;">
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
              index + 1
            }</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${new Date(
              item.createdAt
            ).toLocaleDateString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
              item.order_ref_id?.order_number ?? "N/A"
            }</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
              item?.order_ref_id?.total_amount != null
                ? `₹${item.order_ref_id.total_amount}`
                : "N/A"
            }</td>
          </tr>`
          )
          .join("")
      : `<tr>
          <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: center;">No data available</td>
        </tr>`
  }
</tbody>

  </table>
`;

  const emailContent = `
     <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/blpawxigmdssnw9y21ge.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
    
    <p>Dear <strong>${company_name}</strong>,</p>
    <p>We hope this email finds you well. Please find attached the monthly expense details for ${company_name} for the month of ${month_name} ${year}. This report provides a comprehensive overview of all expenses incurred to keep you informed and up-to-date on our financial activities.
    <p style = "text-align: center;"><b>Your Monthly Activity Report - ${month_name} ${year}</b></p>
    ${table_html}
    <p>
    If you have any questions or need further clarification, please feel free to reach out.
Thank you for your continued support and collaboration.
    </p>
    

    <p>Sincerely,<br/>
    The Team at <strong>Global Employability Information Services India Limited</strong><br/>
   Email: support@quikchek.in , <br/>
   Mobile: +91 9831823898
<br/>
    <a href="https://geisil.com/" target="_blank">www.geisil.com</a></p>   
    
    
               <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
    `;

  const mailOptions = {
    from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
    to: email_send,
    subject: "Monthly Expense Details - " + month_name + " " + year,
    html: emailContent,
  };
  //console.log("Sending email to :" + email_send);
  return mailOptions;
};

export default SendEmail;
