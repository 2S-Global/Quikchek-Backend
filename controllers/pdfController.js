import UserVerification from "../models/userVerificationModel.js";
import puppeteer from "puppeteer";
import GeneratePDF from "./Helpers/pdfHelper.js";

export const generatePDF = async (req, res) => {
  try {
    const order_id = req.body.order_id;

    // Fetching the user based on the order_id
    const user = await UserVerification.findById(order_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user._id.toString();

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const htmlContent = GeneratePDF({ user });

    const headerTemplate = `
      <div style="width: 100%; text-align: center; font-size: 12px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
        <h2 style="margin: 0; color: #333;">QUIKCHEK</h2>
        <p style="margin: 0; font-size: 10px;">1234 Elm Street, Springfield, IL 62704</p>
        <p style="margin: 0; font-size: 10px;">abc@gmail.com | 1234567890</p>
      </div>
    `;

    const footerTemplate = `
      <div style="width: 100%; text-align: center; padding: 5px; font-size: 10px; border-top: 1px solid #ccc;">
        <p style="font-size: 10px; text-align: right; margin: 0;">Verified by QuikCheck using Digilocker</p>
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    `;

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle2" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: "80px",
        bottom: "40px",
      },
    });

    await page.close();
    await browser.close();

    // Optional: Save locally for debugging
    //  fs.writeFileSync(`./debug_user_${userId}.pdf`, pdfBuffer);

    // Set headers and send the PDF file as response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="user_${userId}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    return res.end(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
