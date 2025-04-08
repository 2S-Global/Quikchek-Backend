import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import {
    registerUser,
    loginUser,
    registerCompany,
    listCompanies,
    deleteCompany,
    toggleCompanyStatus,
} from '../controllers/AuthController.js'; // Adjust the path according to your project structure
// Initialize dotenv to load environment variables
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
// Register user candidate
AuthRouter.post('/register', upload.none(), registerUser);
// Login user
AuthRouter.post('/login', upload.none(), loginUser);


// Register company
AuthRouter.post('/company-register', upload.none(), registerCompany);
AuthRouter.post('/list-companies', listCompanies);
AuthRouter.post('/delete-companies', deleteCompany);
AuthRouter.post('/togglestatus-companies', toggleCompanyStatus);

export default AuthRouter;
