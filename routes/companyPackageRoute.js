import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import {
  createCompanyPackage,
  getCompanyPackagesByCompanyId,
  getPackageByCompany,
} from "../controllers/companyPackageController.js";

//Middleware
import userAuth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import Companymid from "../middleware/companyMiddleware.js";

// Initialize dotenv to load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize router
const userRouter = express.Router();

// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// userRouter.post('/list_verified_users', upload.none(), userAuth, Companymid, listUserVerifiedList);

userRouter.post(
  "/createCompanyPackage",
  upload.none(),
  userAuth,
  adminMiddleware,
  createCompanyPackage
);
userRouter.post(
  "/getCompanyPackagesByCompanyId",
  userAuth,
  adminMiddleware,
  getCompanyPackagesByCompanyId
);
userRouter.post(
  "/getPackageByCompany",
  userAuth,
  Companymid,
  getPackageByCompany
);

export default userRouter;
