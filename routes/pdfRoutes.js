import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import { generatePDF, otpgeneratePDF } from "../controllers/pdfController.js";

dotenv.config();
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const pdfRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Generate PDF for verified users
pdfRouter.post("/generate-pdf", generatePDF);
pdfRouter.post("/otp-generate-pdf", otpgeneratePDF);
export default pdfRouter;
