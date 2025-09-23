import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

import User from "../models/userModel.js";
import ownerdetails from "../models/ownerDetailsModel.js";
import UserVerification from "../models/userVerificationModel.js";
import Doclist from "./Helpers/verifiedDetails.js";
import complexReportHelper from "./Helpers/complexReporthelper.js";
export const getallownerforcompany = async (req, res) => {
  try {
    const userId = req.userId;

    const owners = await ownerdetails.find({ complex_id: userId }).lean();
    if (owners.length === 0) {
      res.status(404).json({ message: "No owners found for this company" });
    } else {
      //modified data
      const modifiedOwners = owners.map((owner) => {
        return {
          _id: owner._id,
          name: `${owner.name} (${owner.flat_no || ""})`,
          flat_no: owner.flat_no,
          owner_id: owner._id,
        };
      });

      res.status(200).json({
        success: true,
        data: modifiedOwners,
        message: "Owners fetched successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getreports = async (req, res) => {
  try {
    const userId = req.userId;

    const reports = await UserVerification.find({ employer_id: userId })
      .select("candidate_name owner_id aadhat_otp createdAt")
      .populate([
        {
          path: "owner_id",
          select: "name flat_no",
        },
        {
          path: "order_ref_id",
          select: "total_amount",
        },
      ])
      .lean();

    if (!reports || reports.length === 0) {
      return res
        .status(404)
        .json({ message: "No reports found for this company" });
    }

    await Promise.all(
      reports.map(async (report) => {
        report.document = await Doclist(report._id);
      })
    );

    res.status(200).json({
      success: true,
      data: reports,

      message: "Reports fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};

export const reportPDF = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.body;

    // Build filter object
    const filter = { employer_id: userId };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to include the full end date
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reports = await UserVerification.find(filter)
      .select("candidate_name owner_id aadhat_otp createdAt")
      .populate([
        {
          path: "owner_id",
          select: "name flat_no",
        },
        {
          path: "order_ref_id",
          select: "total_amount",
        },
      ])
      .lean();

    if (!reports.length) {
      return res.status(404).json({
        message: "No reports found for this company in the given date range",
      });
    }

    await Promise.all(
      reports.map(async (report) => {
        report.document = await Doclist(report._id);
      })
    );

    //pdf part
    const fileName = `Report_${user.name}.pdf`;

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();

    const htmlContent = complexReportHelper({
      data: reports,
      startDate,
      endDate,
    });

    const headerTemplate = `
      <div style="width: 100%; text-align: center; font-size: 12px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
        <h2 style="margin: 0; color: #333;">${user.name}</h2>
<p style="margin: 0; font-size: 10px; line-height: 1.6;">
  ${user.address}
</p>

        <p style="margin: 0; font-size: 10px; line-height: 1.6;">Email: ${
          user.email
        }| Phone: ${user.phone || "N/A"}</p>
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
      landscape: false,
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

    /*     res.status(200).json({
      success: true,
      data: reports,
      user,
      headerTemplate,
      footerTemplate,
      htmlContent,
      message: "Reports fetched successfully",
    }); */

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": pdfBuffer.length,
    });

    console.log("PDF generated successfully:", fileName);
    return res.end(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
