import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import {
    addField,
    listFields,
    listFieldsByCompany,
    getAllFields,
    deleteField,
    editField
} from '../controllers/additionalFieldsController.js'; // Adjust the path according to your project structure

//Middleware
//import userAuth from '../middleware/authMiddleware.js';
//import Companymid from '../middleware/companyMiddleware.js';

import userAuth from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
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

userRouter.post('/add_fields', upload.none(),userAuth,adminMiddleware, addField);
userRouter.post('/edit_fields', upload.none(),userAuth,adminMiddleware, editField);
userRouter.post('/list_fields', upload.none(),userAuth,adminMiddleware, listFields);
userRouter.post('/list_fields_by_company', upload.none(),userAuth, listFieldsByCompany);
userRouter.post('/get_all_company_fields', upload.none(),userAuth, getAllFields);
userRouter.post('/delete_fields',  upload.none(),userAuth,adminMiddleware, deleteField);

export default userRouter;
