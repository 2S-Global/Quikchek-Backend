import UserVerification from "../models/userVerificationModel.js";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium"; // Vercel-compatible Chromium
import GeneratePDF from "./Helpers/pdfHelper.js";

export const generatePDF = async (req, res) => {
  try {
    const order_id = req.body.order_id;

    // Fetch the verified user
    const user = await UserVerification.findById(order_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

        <p style="margin: 0; font-size: 10px; line-height: 1.6;">hello@geisil.com | 00348101495</p>
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
        <p style="font-size: 10px; text-align: center; margin: 0;">Verified by QuikCheck using Digilocker</p>
         <p style="font-size: 10px; text-align: center; margin: 0;">Created At: ${createdAt}</p>
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
