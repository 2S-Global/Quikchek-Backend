import UserVerification from "../models/userVerificationModel.js";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium"; // Vercel-compatible Chromium
import GeneratePDF from "./Helpers/pdfHelper.js";
import OtpGeneratePDF from "./Helpers/otppdfHelper.js";
import { getInvoiceData } from "./Helpers/dataHelper.js";
import InvoiceGenerate from "./Helpers/invoicepdf.js";
import ReportGenerate from "./Helpers/reportHelper.js";
import allOrdersData from "../models/allOrders.js";
import { Parser } from "json2csv";
export const generatePDF = async (req, res) => {
  try {
    const order_id = req.body.order_id;

    // Fetch the verified user
    const user = await UserVerification.findById(order_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const company_details = await User.findById(user.employer_id).lean();
    if (!company_details) {
      return res.status(404).json({ message: "Company not found" });
    }
    const company_name = company_details.name;
    const userId = user._id.toString();
    const fileName = `${user.candidate_name}.pdf`;

    // Launch puppeteer using Vercel-compatible chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();

    const htmlContent = GeneratePDF({ user });

    const headerTemplate = `
      <div style="width: 100%; text-align: center; font-size: 12px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
        <h2 style="margin: 0; color: #333;">GLOBAL EMPLOYABILITY INFORMATION SERVICES INDIA LIMITED</h2>
<p style="margin: 0; font-size: 10px; line-height: 1.6;">
  Unit-404, 4th Floor, Webel IT Park (Phase-II),<br />
  Rajarhat, DH Block (Newtown), Action Area 1D,<br />
  Newtown, West Bengal 700160.
</p>

        <p style="margin: 0; font-size: 10px; line-height: 1.6;">support@quikchek.in | 00348101495</p>
      </div>
    `;
    const createdAt = new Date().toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // for AM/PM format
      timeZone: "Asia/Kolkata",
    });

    const footerTemplate = `
    <div style="width: 100%; text-align: center; padding: 5px; font-size: 10px; border-top: 1px solid #ccc;">
      <p style="font-size: 10px; text-align: center; margin: 0;">This KYC verification is being done as per the request from "${company_name}" by QuikCheck using Digilocker. The result is not</p>
      <p style="font-size: 10px; text-align: center; margin: 0;">for any promotional & commercial purposes. I agree to all Terms and Conditions. Created At: ${createdAt}</p>
      Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>
  `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: "120px",
        bottom: "40px",
      },
    });

    await page.close();
    await browser.close();

    // Set headers and send the PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": pdfBuffer.length,
    });
    console.log("PDF generated successfully file name ," + fileName);

    return res.end(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const otpgeneratePDF = async (req, res) => {
  try {
    const order_id = req.body.order_id;

    // Fetch the verified user
    const user = await UserVerification.findById(order_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const company_details = await User.findById(user.employer_id).lean();
    if (!company_details) {
      return res.status(404).json({ message: "Company not found" });
    }
    const company_name = company_details.name;

    const userId = user._id.toString();
    const fileName = `${user.candidate_name}.pdf`;

    // Launch puppeteer using Vercel-compatible chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();

    const htmlContent = OtpGeneratePDF({ user });

    const headerTemplate = `
      <div style="width: 100%; text-align: center; font-size: 12px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
        <h2 style="margin: 0; color: #333;">GLOBAL EMPLOYABILITY INFORMATION SERVICES INDIA LIMITED</h2>
<p style="margin: 0; font-size: 10px; line-height: 1.6;">
  Unit-404, 4th Floor, Webel IT Park (Phase-II),<br />
  Rajarhat, DH Block (Newtown), Action Area 1D,<br />
  Newtown, West Bengal 700160.
</p>

        <p style="margin: 0; font-size: 10px; line-height: 1.6;">support@quikchek.in | 00348101495</p>
      </div>
    `;
    const createdAt = new Date().toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // for AM/PM format
      timeZone: "Asia/Kolkata",
    });

    const footerTemplate = `
    <div style="width: 100%; text-align: center; padding: 5px; font-size: 10px; border-top: 1px solid #ccc;">
      <p style="font-size: 10px; text-align: center; margin: 0;">This KYC verification is being done as per the request from "${company_name}" by QuikCheck using Digilocker. The result is not</p>
      <p style="font-size: 10px; text-align: center; margin: 0;">for any promotional & commercial purposes. I agree to all Terms and Conditions. Created At: ${createdAt}</p>
     
      Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>
  `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: "120px",
        bottom: "40px",
      },
    });

    await page.close();
    await browser.close();

    // Set headers and send the PDF
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": pdfBuffer.length,
    });
    console.log("PDF generated successfully file name ," + fileName);

    return res.end(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const InvoicePDF = async (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    const data = await getInvoiceData(order_id);
    // Fetch the verified user

    const fileName = `${data.company_details.name}.pdf`;

    // Launch puppeteer using Vercel-compatible chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });
    const page = await browser.newPage();

    const htmlContent = InvoiceGenerate({ data }); //this will be changed to invoice pdf

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,

      margin: {
        top: "20px",
        bottom: "20px",
      },
    });

    await page.close();
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": pdfBuffer.length,
    });

    console.log("PDF generated successfully:", fileName);
    return res.end(pdfBuffer);

    //res.status(201).json({ data });
  } catch (error) {
    console.error("Error generating invoice PDF data:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const ReportPDF = async (req, res) => {
  const { start_date, end_date } = req.body;
  console.log("ReportPDF");

  if (!start_date || !end_date) {
    return res
      .status(400)
      .json({ message: "start_date and end_date are required" });
  }

  if (start_date > end_date) {
    return res
      .status(400)
      .json({ message: "start_date cannot be greater than end_date" });
  }

  try {
    const all_transactions = await Transaction.find({
      createdAt: {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      },
    }).populate({
      path: "order_ref_id",
      populate: {
        path: "employer_id",
        model: "User", // Make sure this matches your model name
      },
    });

    const Payment_record = all_transactions.order_ref_id;

    const table_data = all_transactions.map((txn) => {
      const record = txn.order_ref_id || {};
      const employer = record.employer_id || {};

      const cgst = parseFloat(record.cgst) || 0;
      const sgst = parseFloat(record.sgst) || 0;
      const total_amount = parseFloat(record.total_amount) || 0;

      const total_gst = cgst + sgst;
      const main_amount = total_amount - total_gst;

      console.log("main_amount", main_amount);
      console.log("total_gst", total_gst);
      console.log("total ", total_amount);

      return {
        date: record.createdAt || "",
        customer_name: employer.name || "",
        customer_email: employer.email || "",
        customer_address: employer.address || "",
        customer_gst: employer.gst_no || "",
        invoice_no: record.invoice_number || "",
        amount: main_amount,
        gst: total_gst,
      };
    });

    const htmlContent = ReportGenerate({
      data: table_data,
      start_date,
      end_date,
    });

    const fileName = `Report_${start_date}_${end_date}.pdf`;
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });
    const page = await browser.newPage();
    const headerTemplate = `
      <div style="width: 100%; text-align: center; font-size: 12px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
        <h2 style="margin: 0; color: #333;">GLOBAL EMPLOYABILITY INFORMATION SERVICES INDIA LIMITED</h2>
<p style="margin: 0; font-size: 10px; line-height: 1.6;">
  Unit-404, 4th Floor, Webel IT Park (Phase-II),<br />
  Rajarhat, DH Block (Newtown), Action Area 1D,<br />
  Newtown, West Bengal 700160.
</p>

        <p style="margin: 0; font-size: 10px; line-height: 1.6;">support@quikchek.in | 00348101495</p>
      </div>
    `;
    const createdAt = new Date().toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // for AM/PM format
      timeZone: "Asia/Kolkata",
    });

    const footerTemplate = `
      <div style="width: 100%; text-align: center; padding: 5px; font-size: 10px; border-top: 1px solid #ccc;">
        <p style="margin: 0; font-size: 10px; line-height: 1.6;">Generated on ${createdAt}</p>
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: "120px",
        bottom: "40px",
      },
    });

    await page.close();
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": pdfBuffer.length,
    });

    console.log("PDF generated successfully:", fileName);
    return res.end(pdfBuffer);

    //res.status(201).json({ table_data });
  } catch (error) {
    console.error("Error generating Report PDF data:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const ReportCsv = async (req, res) => {
  const { start_date, end_date } = req.body;
  console.log("ReportCSV");

  if (!start_date || !end_date) {
    return res
      .status(400)
      .json({ message: "start_date and end_date are required" });
  }

  if (start_date > end_date) {
    return res
      .status(400)
      .json({ message: "start_date cannot be greater than end_date" });
  }

  const start = new Date(start_date);
  const end = new Date(end_date);

  const Payment_record = await allOrdersData.find({
    createdAt: { $gte: start, $lte: end },
  });

  if (!Payment_record || Payment_record.length === 0) {
    return res.status(404).json({ message: "Payment record not found" });
  }

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const table_data = Payment_record.map((txn) => ({
    "Export Type": "WOPAY",
    "Invoice Number": txn.invoice_number,
    "Invoice date": formatDate(txn.createdAt),
    "Invoice Value (Inr)": parseFloat(txn.total_amount),
    "Port Code": "",
    "Shipping Bill Number": "",
    "Shipping Bill Date": "",
    Rate: 0,
    "Taxable Value (Inr)": parseFloat(txn.total_amount),
    "Cess Amount": 0,
  }));

  try {
    const fields = [
      "Export Type",
      "Invoice Number",
      "Invoice date",
      "Invoice Value (Inr)",
      "Port Code",
      "Shipping Bill Number",
      "Shipping Bill Date",
      "Rate",
      "Taxable Value (Inr)",
      "Cess Amount",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(table_data);

    res.header("Content-Type", "text/csv");
    res.attachment(`report_${start_date}_to_${end_date}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error("CSV generation error:", err);
    return res.status(500).json({ message: "Failed to generate CSV" });
  }
};

export const ReportTable = async (req, res) => {
  const { start_date, end_date } = req.body;
  console.log("ReportPDF");

  if (!start_date || !end_date) {
    return res
      .status(400)
      .json({ message: "start_date and end_date are required" });
  }

  if (start_date > end_date) {
    return res
      .status(400)
      .json({ message: "start_date cannot be greater than end_date" });
  }

  try {
    const all_transactions = await Transaction.find({
      createdAt: {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      },
    }).populate({
      path: "order_ref_id",
      populate: {
        path: "employer_id",
        model: "User", // Make sure this matches your model name
      },
    });

    const Payment_record = all_transactions.order_ref_id;

    const table_data = all_transactions.map((txn) => {
      const record = txn.order_ref_id || {};
      const employer = record.employer_id || {};

      const cgst = parseFloat(record.cgst) || 0;
      const sgst = parseFloat(record.sgst) || 0;
      const total_amount = parseFloat(record.total_amount) || 0;

      const total_gst = cgst + sgst;
      const main_amount = total_amount - total_gst;

      console.log("main_amount", main_amount);
      console.log("total_gst", total_gst);
      console.log("total ", total_amount);

      return {
        date: record.createdAt || "",
        customer_name: employer.name || "",
        customer_email: employer.email || "",
        customer_address: employer.address || "",
        customer_gst: employer.gst_no || "",
        invoice_no: record.invoice_number || "",
        amount: main_amount,
        gst: total_gst,
      };
    });

    res.status(201).json({ table_data });
  } catch (error) {
    console.error("Error generating Report PDF data:", error.message);
    return res.status(500).json({ message: error.message });
  }
};
