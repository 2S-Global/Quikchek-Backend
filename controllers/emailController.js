import User from "../models/userModel.js";
import Email from "../models/emailModel.js";
import UserVerification from "../models/userVerificationModel.js";
import allOrdersData from "../models/allOrders.js";
import SendEmail from "../controllers/email_Helper/emailhelper.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const preparedb = async (req, res) => {
  console.log("Preparing database...");

  const last_month = new Date().getMonth();
  const this_year = new Date().getFullYear();

  console.log("last_month", last_month);
  console.log("this_year", this_year);

  // Get all users from the database
  const users = await User.find({ is_del: false, role: 1 });
  let count = 0;

  // Loop through each user and check if the email record exists
  for (const user of users) {
    const company_email = user.email;
    const employer_id = user._id;

    // Check if the email record already exists for the user
    const existingEmail = await Email.findOne({
      employer_id: employer_id,
      month_no: last_month,
      year: this_year,
    });

    if (!existingEmail) {
      // If the email record does not exist, create a new one
      const newEmail = new Email({
        employer_id: employer_id,
        company_email: company_email,
        month_no: last_month,
        year: this_year,
      });
      await newEmail.save();
      console.log("New email record created for user:", employer_id);
    } else {
      console.log("Email record already exists for user:", employer_id);
    }

    count++;
  }
  console.log("total count:", count);
  res.status(200).json({
    message: "Database prepared successfully",
  });
};

export const sendEmail = async (req, res) => {
  console.log("sending email...");
  // Find one email record
  const email = await Email.findOne({ email_sent: false }).populate(
    "employer_id"
  );
  if (!email) {
    return res.status(201).json({
      message: "No email record found",
    });
  }
  const month_no = email.month_no;
  const year = email.year;
  const month_name = new Date(0, month_no - 1).toLocaleString("default", {
    month: "long",
  });
  console.log("month_name", month_name);
  const start_date = new Date(Date.UTC(year, month_no - 1, 1));
  const end_date = new Date(Date.UTC(year, month_no, 0, 23, 59, 59, 999)); // Last day of the month

  //get data from user verification model
  const user_verification = await UserVerification.find({
    employer_id: email.employer_id._id,
    createdAt: { $gte: start_date, $lte: end_date },
  }).populate("order_ref_id");

  const table_data = user_verification;

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //send email
  try {
    const mailOptions = await SendEmail({
      table_data,
      month_name,
      email,
      year,
    });
    const info = await transporter.sendMail(mailOptions);

    //console.log("Email sent successfully:", info.messageId);

    const length = table_data.length;
    const time_now = new Date();
    // console.log("length", length);
    const feedback =
      "Total order length: " +
      length +
      " orders. Email sent at: " +
      time_now.toISOString() +
      "Email was sent to :" +
      mailOptions.to +
      " and was sent by: " +
      mailOptions.from +
      "Email msg ID :" +
      info.messageId +
      "company Name: " +
      email.employer_id.name;

    // Update the email record to indicate that the email has been sent
    email.email_sent = true;
    email.email_sent_date = time_now;
    email.feedback = feedback;
    await email.save();
  } catch (error) {
    console.error("Error sending email:", error);
    email.email_sent = true;
    email.feedback =
      "Could not send email.Error sending email: " + error.message;
    await email.save();
  }

  res.status(200).json({
    message: "Email record found",
    feedback: email.feedback,
    /*  data: table_data,
    email: email,
    month_name: month_name,
    year: year, */
  });
};
