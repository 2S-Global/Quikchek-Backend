import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import {
  changePassword,
  registerUser,
  loginUser,
  registerCompany,
  listCompanies,
  deleteCompany,
  deleteAccount,
  toggleCompanyStatus,
  editUser,
  forgotPassword,
  listFieldsByCompany,
  getUserDetailsById,
  RegisterFrontEnd,
  listSelfRegisteredCompanies,
  sendAccessEmail,
  listCompaniesAll,
  verifyEmail,
  validtoken,
} from "../controllers/AuthController.js"; // Adjust the path according to your project structure
// Initialize dotenv to load environment variables

import userAuth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import Companymid from "../middleware/companyMiddleware.js";
// Adjust path if needed

dotenv.config();
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Initialize router
const AuthRouter = express.Router();
// Setup multer with memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
//chabnge password
AuthRouter.post("/change-password", upload.none(), userAuth, changePassword);
//valid token
AuthRouter.get("/validtoken", userAuth, validtoken);
// Register user candidate
AuthRouter.post("/register-frontend", upload.none(), RegisterFrontEnd);

// Register user candidate
AuthRouter.post(
  "/register",
  userAuth,
  adminMiddleware,
  upload.none(),
  registerUser
);
AuthRouter.post(
  "/edit_user",
  userAuth,
  adminMiddleware,
  upload.none(),
  editUser
);
AuthRouter.post(
  "/list_fields_by_company",
  userAuth,
  adminMiddleware,
  upload.none(),
  listFieldsByCompany
);
AuthRouter.post("/get_company_details", upload.none(), getUserDetailsById);

// Login user
AuthRouter.post("/login", upload.none(), loginUser);
AuthRouter.post("/forgotpass", upload.none(), forgotPassword);
AuthRouter.post(
  "/sendAccessEmail",
  upload.none(),
  userAuth,
  adminMiddleware,
  sendAccessEmail
);

// Register company
AuthRouter.post(
  "/company-register",
  upload.none(),
  userAuth,
  adminMiddleware,
  registerCompany
);
AuthRouter.post("/list-companies", userAuth, adminMiddleware, listCompanies);
AuthRouter.post(
  "/list-companies_all",
  userAuth,
  adminMiddleware,
  listCompaniesAll
);
AuthRouter.post(
  "/list-companies-self",
  userAuth,
  adminMiddleware,
  listSelfRegisteredCompanies
);
AuthRouter.post("/delete-companies", userAuth, adminMiddleware, deleteCompany);
AuthRouter.post("/delete-account", userAuth, deleteAccount);
AuthRouter.post(
  "/togglestatus-companies",
  userAuth,
  adminMiddleware,
  toggleCompanyStatus
);
AuthRouter.get("/verify-email/:token", verifyEmail);

export default AuthRouter;
